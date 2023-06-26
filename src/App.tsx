import React, { useEffect, useRef, useState } from 'react';
import './App.css';  // Import your CSS

// Define the type of the post
interface Post {
  text: string;
  $type: string;
  reply: object;
  createdAt: string;
  username: string;
  postLink: string;
}

const App: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const postsEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    postsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:5000');

    socket.onopen = () => {
      console.log('Connected');
    };

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.lastMessage && data.lastMessage.record) {  // Add this check
    const post: Post = data.lastMessage.record;
    post.username = data.lastMessage.username;  // Add the username
    post.postLink = data.lastMessage.postLink;  // Add the post link
    setPosts((posts) => [...posts, post]);
  }
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

  useEffect(scrollToBottom, [posts]);

  return (
    <div className="app">
      <h1>Live Posts</h1>
      <div className="posts">
        {posts.map((post, index) => (
          <div key={index} className="post">
            <p className="username">{post.username}</p>
            <p className="timestamp">
              {new Date(post.createdAt).toLocaleString()}
            </p>
            <p className="text">{post.text}</p>
            <a href={post.postLink} target="_blank" rel="noopener noreferrer" className="post-link">View post</a>
          </div>
        ))}
        <div ref={postsEndRef} />
      </div>
    </div>
  );
};

export default App;

