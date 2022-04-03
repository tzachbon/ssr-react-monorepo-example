import type { ChildProcess } from 'child_process';
import { once } from 'events';

export async function getPortFromChildProcess(child: ChildProcess) {
  const [{ port }] = (await once(child, 'message')) as [{ port: number }];

  return port;
}
