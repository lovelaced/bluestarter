// types.ts

export interface Post {
  text: string;
  $type: string;
  reply: object;
  createdAt: string;
  username: string;
  postLink: string;
  avatar: string;
}

