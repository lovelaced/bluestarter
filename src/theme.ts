// theme.ts

import { createStitches } from '@stitches/react';
import * as ScrollArea from '@radix-ui/react-scroll-area';

const { css, styled } = createStitches({
  theme: {
    colors: {
      light: '#CCE5FF',  // Pantone Baby Blue 10
      primary: '#80BDFF',  // Pantone Baby Blue 30
      secondary: '#4F97D7',  // Pantone Baby Blue 50
      tertiary: '#3390CE',  // Pantone Baby Blue 60
      dark: '#0079BD',  // Pantone Baby Blue 100
    },
    space: {
      '1': '0.25rem',
      '2': '0.5rem',
      '3': '0.75rem',
      '4': '1rem',
      '5': '1.25rem',
      '6': '1.5rem',
    },
    fonts: {
      body: 'Roboto, sans-serif',
    },
    fontSizes: {
      body: '1rem',
      heading: '1.5rem',
    },
    lineHeights: {
      body: '1.5',
      heading: '1.2',
    },
  },
});

export const ScrollRoot = styled(ScrollArea.Root, {
  width: '100%',
  height: '80vh',
  borderRadius: '0.5rem',
  overflow: 'hidden',
  position: 'relative',
  backgroundColor: '$light', // Use the light color from the theme
});

export const ScrollViewport = styled(ScrollArea.Viewport, {
  width: '100%',
  height: '100%',
  paddingRight: '$6',
  boxSizing: 'border-box',
  overflowY: 'scroll',
});

export const Scrollbar = styled(ScrollArea.Scrollbar, {
  display: 'flex',
  userSelect: 'none',
  touchAction: 'none',
  padding: '$2',
  backgroundColor: '$light',
  position: 'absolute',
  right: 0,
  top: 0,
  bottom: 0,
  zIndex: 1,
  '&[data-orientation="vertical"]': {
    width: '16px',
  },
});

export const ScrollbarThumb = styled(ScrollArea.Thumb, {
  flex: 1,
  borderRadius: '9999px',
  backgroundColor: '$primary', // use the vibrant primary color
  transition: 'background 160ms ease-in-out',
  '&:hover': {
    backgroundColor: '$primary',
  },
  '&[data-pressed]': {
    backgroundColor: '$primary',
  },
});

export { css, styled };

