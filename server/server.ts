import { Application } from "https://deno.land/x/oak/mod.ts";
import { oakCors } from "https://deno.land/x/cors/mod.ts";
import { WebSocketServer, WebSocketClient } from "https://deno.land/x/websocket/mod.ts";
import { Subscription } from "@atproto/xrpc-server";
import pkg from "@atproto/api";
import { WriteOpAction, cborToLexRecord, readCarWithRoot } from "@atproto/repo";
const { AtUri } = pkg;

const clients: Set<WebSocketClient> = new Set();

// Fetch data from your service and push to all connected clients
async function fetchData() {
  // console.log("fetchData called");

  const sub = new Subscription({
    // service: 'wss://bsky.social',
    service: 'wss://bgs.bsky-sandbox.dev',
    method: "com.atproto.sync.subscribeRepos",
    validate: (body) => body,
  });

  console.log("Subscription created");

  for await (const frameBody of sub) {
   // console.log("Received frameBody from subscription");
   // console.log("frameBody", frameBody);

    let data = {
      count: 0,
      countSinceLast: 0,
      postCount: 0,
      likeCount: 0,
      followCount: 0,
      repo: "bsky.social",
      isConnected: false,
      error: null,
      lastMessage: null,
      lastNonEmptyMessage: null,
      startTime: Date.now(),
    };

    data.isConnected = true;
   // console.log("Set isConnected to true");

    try {
     // console.log("Checking if frameBody.blocks is an instance of Uint8Array");
      if (!(frameBody.blocks instanceof Uint8Array)) {
      //  console.log("frameBody.blocks is not an instance of Uint8Array, returning");
        return;
      }
     // console.log("Reading car with root");
      const car = await readCarWithRoot(frameBody.blocks);
     // console.log("Car read", car);

      const ops = [];
     // console.log("Processing frameBody.ops");
      frameBody.ops.forEach((op) => {
        console.log("Processing op", op);
        data.count += 1;
        data.countSinceLast += 1;

        const [collection, rkey] = op.path.split("/");
       // console.log("Split path into collection and rkey", collection, rkey);
        if (
          op.action === WriteOpAction.Create ||
          op.action === WriteOpAction.Update
        ) {
          // console.log("Action is create or update");
          const cid = op.cid;
         // console.log("Got cid", cid);
          const record = car.blocks.get(cid);
         // console.log("Got record", record);
          ops.push({
            action: op.action,
            cid: op.cid.toString(),
            record: cborToLexRecord(record),
            blobs: [], // @TODO need to determine how the app-view provides URLs for processed blobs
            uri: AtUri.make(frameBody.repo, collection, rkey).toString(),
          });
          // console.log("Pushed new op to ops");
        } else if (op.action !== WriteOpAction.Delete) {
          console.warn(`ERROR: Unknown repo op action: ${op.action}`);
          data.error = `Unknown action: ${op.action}`;
        }

        ops.forEach((op) => {
       //   console.log("Processing op", op);
          data.lastMessage = op;
         // console.log("Set lastMessage to op");
          if (op.record?.text) {
          //  console.log("Op record has text", op.record.text);
            data.lastNonEmptyMessage = op.record.text;
          //  console.log("Set lastNonEmptyMessage to record text");
          }

          if (op.record?.$type === "app.bsky.feed.like") {
          //  console.log("Op record is a like");
            data.likeCount += 1;
          //  console.log("Incremented likeCount");
          }

          if (op.record?.$type === "app.bsky.feed.post") {
          //  console.log("Op record is a post");
            data.postCount += 1;
          //  console.log("Incremented postCount");
          }

          if (op.record?.$type === "app.bsky.graph.follow") {
          //  console.log("Op record is a follow");
            data.followCount += 1;
          //  console.log("Incremented followCount");
          }
        });
      });
    } catch (err) {
      console.error("Unable to process frameBody", frameBody, err);
      data.error = err;
    }

    console.log("Data processed successfully, sending data to clients");
    for (const client of clients) {
  //    console.log("Sending data to client", client);
      client.send(JSON.stringify(data));
  //    console.log("Data sent to client");
    }
  }
}

// Setup WebSocket handling
const wss = new WebSocketServer(5000);
wss.on("connection", (ws: WebSocketClient) => {
  console.log("New client connection", ws);
  clients.add(ws);
  console.log("Added new client to clients set");

  ws.on("message", (message: string) => {
    console.log("Received message from client", message);
  });

  ws.on("close", () => {
    console.log("Client connection closed", ws);
    clients.delete(ws);
    console.log("Deleted client from clients set");
  });
});

// Fetch data periodically (e.g., every second)
console.log("Setting up fetchData interval");
setInterval(fetchData, 1000);

// Setup HTTP server
console.log("Setting up HTTP server");
const app = new Application();

console.log("Enabling CORS for all routes");
app.use(oakCors());

app.use((ctx) => {
  console.log("Received HTTP request", ctx.request);
  ctx.response.body = "Hello, World!";
  console.log("Sent HTTP response");
});

// Start server
console.log("Starting server");
app.listen({ port: 8000 });
console.log("Server started");

