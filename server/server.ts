import { Application } from "https://deno.land/x/oak/mod.ts";
import { oakCors } from "https://deno.land/x/cors/mod.ts";
import { WebSocketServer, WebSocketClient } from "https://deno.land/x/websocket/mod.ts";
import { Subscription } from "@atproto/xrpc-server";
import pkg from "@atproto/api";
import * as dotenv from "dotenv";
import { WriteOpAction, cborToLexRecord, readCarWithRoot } from "@atproto/repo";
import logger from "./logger.ts";
const { AtUri } = pkg;

const clients: Set<WebSocketClient> = new Set();

// Fetch data from your service and push to all connected clients
async function fetchData() {
  logger.debug("fetchData called");

  const sub = new Subscription({
    service: 'wss://bsky.social',
  //  service: 'wss://bgs.bsky-sandbox.dev',
    method: "com.atproto.sync.subscribeRepos",
    validate: (body) => body,
  });

  console.log("Subscription created");

  for await (const frameBody of sub) {
   logger.debug("Received frameBody from subscription");
   logger.debug("frameBody", frameBody);

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
   logger.debug("Set isConnected to true");

    try {
     logger.debug("Checking if frameBody.blocks is an instance of Uint8Array");
      if (!(frameBody.blocks instanceof Uint8Array)) {
      logger.debug("frameBody.blocks is not an instance of Uint8Array, returning");
        return;
      }
     logger.debug("Reading car with root");
      const car = await readCarWithRoot(frameBody.blocks);
     logger.debug("Car read", car);

      const ops = [];
     logger.debug("Processing frameBody.ops");
     logger.debug("Framebody repo:", frameBody.repo);
      for (const op of frameBody.ops) {
      //frameBody.ops.forEach((op) => {
       logger.debug("Processing op", op);
        data.count += 1;
        data.countSinceLast += 1;

        const [collection, rkey] = op.path.split("/");
       logger.debug("Split path into collection and rkey", collection, rkey);
        if (
          op.action === WriteOpAction.Create ||
          op.action === WriteOpAction.Update
        ) {
          logger.debug("Action is create or update");
          const cid = op.cid;
         logger.debug("Got cid", cid);
          const record = car.blocks.get(cid);
          const username = await getAlsoKnownAs(frameBody.repo);
          //const postLink = `https://bsky.app/profile/${username}/post/${op.rkey}`;
	  const postLink = generatePostLink(username, rkey);

       logger.debug("Got record", cborToLexRecord(record));
          ops.push({
            action: op.action,
            cid: op.cid.toString(),
            record: cborToLexRecord(record),
            blobs: [], // @TODO need to determine how the app-view provides URLs for processed blobs
            uri: AtUri.make(frameBody.repo, collection, rkey).toString(),
	    username: username,
	    postLink: postLink
	  });
          logger.debug("Pushed new op to ops");
        } else if (op.action !== WriteOpAction.Delete) {
          logger.warning(`ERROR: Unknown repo op action: ${op.action}`);
          data.error = `Unknown action: ${op.action}`;
        }
        for (const op of ops) {
       // ops.forEach((op) => {
          logger.debug("Processing op", op);
          data.lastMessage = op;
          logger.debug("Set lastMessage to", op);
          if (op.record?.text) {
          logger.debug("Op record has text", op.record.text);
            data.lastNonEmptyMessage = op.record.text;
         logger.debug("Set lastNonEmptyMessage to record text");
          }

          if (op.record?.$ === "app.bsky.feed.like") {
          logger.debug("Op record is a like");
            data.likeCount += 1;
          logger.debug("Incremented likeCount");
          }

          if (op.record?.$ === "app.bsky.feed.post") {
          logger.debug("Op record is a post");
            data.postCount += 1;
          logger.debug("Incremented postCount");
          }

          if (op.record?.$ === "app.bsky.graph.follow") {
          logger.debug("Op record is a follow");
            data.followCount += 1;
          logger.debug("Incremented followCount");
          }
        }
      }
    } catch (err) {
      console.error("Unable to process frameBody", frameBody, err);
      data.error = err;
    }
    logger.debug("Processed data:", data)

    logger.debug("Data processed successfully, sending data to clients");
    for (const client of clients) {
    logger.debug("Sending data to client", client);
      client.send(JSON.stringify(data));
    logger.debug("Data sent to client:", data);
    }
  }
}

async function getAlsoKnownAs(did: string): Promise<string> {
 // const response = await fetch(`https://plc.bsky-sandbox.dev/${did}/data`);
  const response = await fetch(`https://plc.directory/${did}/data`);
  const data = await response.json();
  logger.debug("response data from plc:", data);
  return data.alsoKnownAs[0].split('://')[1];
}

function generatePostLink(alsoKnownAs: string, rkey: string): string {
  return `https://bsky.app/profile/${alsoKnownAs}/post/${rkey}`;
}

// Setup WebSocket handling
const wss = new WebSocketServer(5000);
wss.on("connection", (ws: WebSocketClient) => {
  console.log("New client connection");
  clients.add(ws);
  console.log("Added new client to clients set");

  ws.on("message", (message: string) => {
    console.log("Received message from client", message);
  });

  ws.on("close", () => {
    console.log("Client connection closed");
    clients.delete(ws);
    console.log("Deleted client from clients set");
  });
});

// Fetch data periodically (e.g., every second)
console.log("Starting data fetch");
fetchData();

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

