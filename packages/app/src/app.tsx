import type React from 'react';

export interface AppProps {
  text: string;
}

export const App: React.VFC<AppProps> = ({ text }) => <h1>{text}</h1>;
