import { spawn } from 'child_process';

export async function serve(directory: string, port = 8080) {
  const args = [require.resolve('./static-serve-server'), directory, port.toString()];
  const child = spawn('node', args, {
    stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
  });

  return {
    close: () => {
      try {
        child.kill();
      } catch (e) {
        console.log('Kill Server Error:' + e);
      }
    },
  };
}
