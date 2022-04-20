import type React from 'react';

export interface AppProps {
  text: string;
}

export const App: React.FC<AppProps> = ({ text }) => <h1 suppressHydrationWarning>{text}</h1>;
