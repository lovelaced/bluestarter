import { useEffect, useRef } from 'react';
import { createStitches } from '@stitches/react';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import { Post } from './types';
import { css, ScrollRoot, ScrollViewport, Scrollbar, ScrollbarThumb } from './theme';
import useWebSocket from './useWebSocket';
import Feed from './components/Feed'; // import the Feed component

const App = () => {
  const posts = useWebSocket('ws://localhost:5000');
  const postsEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    postsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [posts]);

  const appClass = css({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '$gray100',
    fontFamily: '$body',
    color: '$gray900',
  })();

  const headerClass = css({
    fontSize: '$heading',
    lineHeight: '$heading',
    marginBottom: '$4',
  })();

  return (
    <div className={appClass}>
      <h1 className={headerClass}>Live Posts</h1>
      <ScrollRoot>
        <ScrollViewport>
          <Feed posts={posts} /> {/* Use the Feed component here */}
          <div ref={postsEndRef} />
        </ScrollViewport>
        <Scrollbar orientation="vertical">
          <ScrollbarThumb />
        </Scrollbar>
      </ScrollRoot>
    </div>
  );
};

export default App;

