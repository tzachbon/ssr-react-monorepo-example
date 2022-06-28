import type { FC } from 'react';

export const Title: FC<{ children: string }> = ({ children }) => {
  return <h1>{children}</h1>;
};
