import React, { useEffect, useState } from 'react';

// Define the type of the post
interface Post {
  text: string;
  $type: string;
  reply: object;
  createdAt: string;
}

const App: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:5000');

    socket.onopen = () => {
      console.log('Connected');
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const post: Post = data.lastMessage.record;
      setPosts((posts) => [...posts, post]);
    };

    socket.onerror = (error) => {
      console.log('WebSocket error: ', error);
    };

    socket.onclose = () => {
      console.log('Disconnected');
    };

    return () => {
      socket.close();
    };
  }, []);

  return (
    <div style={{ padding: "10px", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ textAlign: "center" }}>Live Posts</h1>
      {posts.map((post, index) => (
        <div key={index} style={{
            border: "1px solid #ccc",
            borderRadius: "10px",
            padding: "10px",
            marginBottom: "10px",
            boxShadow: "2px 2px 5px rgba(0,0,0,0.1)"
        }}>
          <p style={{ color: "#888", marginBottom: "10px" }}>
            {new Date(post.createdAt).toLocaleString()}
          </p>
          <p>{post.text}</p>
        </div>
      ))}
    </div>
  );
};

export default App;

