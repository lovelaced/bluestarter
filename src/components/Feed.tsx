import React from 'react';
import * as AspectRatio from '@radix-ui/react-aspect-ratio';
import * as Avatar from '@radix-ui/react-avatar';
import { styled } from '../theme';

const PostContainer = styled('a', {
  display: 'flex',
  flexDirection: 'column',
  margin: '1em',
  boxShadow: 'none',
  borderRadius: '10px',
  textDecoration: 'none',
  color: '$dark',
  backgroundColor: '$light',
  '&:hover': {
    backgroundColor: '$primary',
    color: '$light',
    textDecoration: 'none',
  },
});

const PostContent = styled('div', {
  padding: '1em',
  borderRadius: '0 0 10px 10px',
});

const PostHeader = styled('div', {
  display: 'flex',
  alignItems: 'center',
  marginBottom: '0.5em',
});

const Username = styled('span', {
  marginLeft: '0.5em',
  fontWeight: 'bold',
});

const Timestamp = styled('span', {
  color: '$tertiary',
  fontSize: '0.8em',
  marginLeft: '0.5em',
});

const AvatarAndHeader = styled('div', {
  display: 'flex',
  margin: '0.5em',
  flexDirection: 'row',
  justifyContent: 'start',
});

const PostText = styled('p', {
  fontSize: '1.1em',
  lineHeight: '1.6',
});

const Feed = ({ posts }) => {
  return (
    <div>
      {posts.map((post, index) => (
        <PostContainer href={post.postLink} target="_blank" rel="noopener noreferrer">
            <AvatarAndHeader>
                <Avatar.Root>
                  {/* Check if the avatar property exists, and if it doesn't, use the fallback */}
                  {post.avatar ? (
                    <Avatar.Image
                      src={post.avatar}
                      alt={post.username}
                    />
                  ) : (
                    <Avatar.Fallback>{post.username[0]}</Avatar.Fallback>
                  )}
                </Avatar.Root>
                <PostHeader>
                  <Username>{post.username}</Username>
                  <Timestamp>{new Date(post.createdAt).toLocaleString()}</Timestamp>
                </PostHeader>
            </AvatarAndHeader>
            <PostContent>
              <PostText>{post.text}</PostText>
            </PostContent>
        </PostContainer>
      ))}
    </div>
  );
};

export default Feed;

