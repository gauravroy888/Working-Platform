const fs = require('fs');
const path = require('path');
const babel = require('@babel/core');

function checkFile(filename) {
  console.log(`Checking ${filename}...`);
  const filePath = path.join(__dirname, filename);
  const html = fs.readFileSync(filePath, 'utf8');
  
  // Find all <script type="text/babel"> blocks
  const regex = /<script type="text\/babel">([\s\S]*?)<\/script>/g;
  let match;
  let count = 0;
  
  while ((match = regex.exec(html)) !== null) {
    count++;
    const code = match[1];
    try {
      babel.transformSync(code, {
        presets: ['@babel/preset-react'],
        filename: filename + `_block_${count}.js`
      });
      console.log(`  Block ${count} compiled successfully.`);
    } catch (err) {
      console.error(`  Error compiling Block ${count}:`);
      console.error(err.message);
    }
  }
  
  if (count === 0) {
    console.log('  No babel script blocks found.');
  }
}

checkFile('Chapter_experience_L_S.html');
checkFile('quiz.html');
