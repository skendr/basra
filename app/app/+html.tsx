import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, maximum-scale=1, user-scalable=no"
        />
        <meta name="theme-color" content="#1a1a2e" />
        <meta name="description" content="Basra - Egyptian Card Game. Play online with friends!" />
        <title>Basra - Egyptian Card Game</title>
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: responsiveStyle }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const responsiveStyle = `
body {
  background-color: #1a1a2e;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
#root {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}
`;
