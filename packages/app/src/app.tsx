import type React from 'react';
import { lazy, Suspense, useEffect } from 'react';

const Title = lazy(() => import('./components/title.js').then((module) => ({ default: module.Title })));

export interface AppProps {
  text: string;
}

export const App: React.FC<AppProps> = ({ text }) => {
  useEffect(() => {
    console.log('hello from client!');
  }, []);

  return (
    <Suspense fallback="loading...">
      <Title>{text}</Title>
    </Suspense>
  );
};
