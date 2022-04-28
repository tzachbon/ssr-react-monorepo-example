import { fork, spawn } from 'child_process';
import { getPortFromChildProcess } from './helper';

export async function serve(directory: string, preferredPort = 8080) {
  const args = [require.resolve('e2e-test-kit/static-serve-server'), directory, preferredPort.toString()];
  const child = spawn('node', args, {
    stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
  });

  return {
    port: await getPortFromChildProcess(child),
    close: () => {
      try {
        child.kill();
      } catch (e) {
        console.log(`Kill Server Error: ${String(e)}`);
      }
    },
  };
}

export async function runService(pathToServe: string, preferredPort = 8080) {
  const child = fork(pathToServe, [preferredPort.toString()], {
    stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
  });

  return {
    port: await getPortFromChildProcess(child),
    close: () => {
      try {
        child.kill();
      } catch (e) {
        console.log(`Kill Server Error: ${String(e)}`);
      }
    },
  };
}
