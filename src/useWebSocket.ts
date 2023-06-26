// useWebSocket.ts

import { useEffect, useState } from 'react';
import { Post } from './types';

const useWebSocket = (url: string) => {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const socket = new WebSocket(url);
    socket.onopen = () => {
      console.log('Connected');
    };

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  // Check if the record exists and is of type "post"
  if (data.lastMessage && data.lastMessage.record && data.lastMessage.record.$type === "app.bsky.feed.post") {
    const post: Post = data.lastMessage.record;
    post.username = data.lastMessage.username;
    post.postLink = data.lastMessage.postLink;
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
  }, [url]);

  return posts;
};

export default useWebSocket;

