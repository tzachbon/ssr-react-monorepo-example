import type React from 'react';
import { useEffect } from 'react';

export interface AppProps {
  text: string;
}

export const App: React.FC<AppProps> = ({ text }) => {
  useEffect(() => {
    console.log('hello from client!');
  }, []);

  return <h1>{text}</h1>;
};
