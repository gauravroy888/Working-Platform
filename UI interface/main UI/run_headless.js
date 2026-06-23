const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const url = process.argv[2] || 'http://localhost:3000/quiz.html';
console.log(`Launching Edge headless to load ${url} and capture logs...`);

const edgePaths = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
];

let edgePath = null;
for (const p of edgePaths) {
  if (fs.existsSync(p)) {
    edgePath = p;
    break;
  }
}

if (!edgePath) {
  console.error('Could not find Edge or Chrome executable!');
  process.exit(1);
}

// Create a temp user data directory to ensure we get a fresh clean log file
const userDataDir = path.join(__dirname, 'edge_user_data');
if (!fs.existsSync(userDataDir)) {
  fs.mkdirSync(userDataDir);
}

const child = spawn(edgePath, [
  '--headless=new',
  '--disable-gpu',
  '--enable-logging',
  '--log-level=0',
  '--disable-cache',
  `--user-data-dir=${userDataDir}`,
  url
]);

let stdout = '';
let stderr = '';

child.stdout.on('data', (data) => {
  stdout += data.toString();
});

child.stderr.on('data', (data) => {
  stderr += data.toString();
});

// Let it run for 6 seconds so Babel compiles and React tries to render, then close
setTimeout(() => {
  console.log('Timeout reached, killing browser...');
  child.kill();
}, 6000);

child.on('close', (code) => {
  console.log(`Browser exited.`);
  
  // Read edge_user_data/chrome_debug.log or similar
  const logFile = path.join(userDataDir, 'chrome_debug.log');
  if (fs.existsSync(logFile)) {
    const logs = fs.readFileSync(logFile, 'utf8');
    fs.writeFileSync('console_logs.txt', logs);
    console.log(`Saved console logs to console_logs.txt (${logs.length} chars)`);
  } else {
    console.log('No chrome_debug.log found in user data directory.');
    // Check if it's in the current directory
    if (fs.existsSync('chrome_debug.log')) {
      const logs = fs.readFileSync('chrome_debug.log', 'utf8');
      fs.writeFileSync('console_logs.txt', logs);
      console.log(`Saved console logs to console_logs.txt from current dir (${logs.length} chars)`);
    } else {
      console.log('No chrome_debug.log found anywhere.');
    }
  }
});
