const { spawn } = require('child_process');
const path = require('path');

// Start Vite dev server
const vite = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true
});

// Start JioSaavn API server
const jiosaavn = spawn('python', ['app.py'], {
  stdio: 'inherit',
  shell: true,
  cwd: path.join(__dirname, 'JioSaavnAPI')
});

process.on('SIGINT', () => {
  vite.kill();
  jiosaavn.kill();
  process.exit();
});

vite.on('close', (code) => {
  jiosaavn.kill();
  process.exit(code);
});

jiosaavn.on('close', (code) => {
  vite.kill();
  process.exit(code);
});
