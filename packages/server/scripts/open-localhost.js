import open from 'open';

setTimeout(() => {
  void open('http://localhost:5050').catch((e) => {
    console.error(e);
    process.exit(1);
  });
}, 500);
