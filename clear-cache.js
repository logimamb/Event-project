const fs = require('fs');
const path = require('path');

// Directories to clear
const directoriesToClear = [
  '.next',
  '.turbo',
  'node_modules/.cache',
  'node_modules/.vite'
];

// Function to remove directory recursively
function removeDirectory(dirPath) {
  if (fs.existsSync(dirPath)) {
    console.log(`Removing ${dirPath}...`);
    fs.rmSync(dirPath, { recursive: true, force: true });
    console.log(`Removed ${dirPath}`);
  }
}

// Clear each directory
directoriesToClear.forEach(dir => {
  const fullPath = path.join(__dirname, dir);
  removeDirectory(fullPath);
});

// Touch the messages files to update their timestamps
const messagesDir = path.join(__dirname, 'messages');
if (fs.existsSync(messagesDir)) {
  fs.readdirSync(messagesDir).forEach(file => {
    if (file.endsWith('.json')) {
      const filePath = path.join(messagesDir, file);
      const now = new Date();
      fs.utimesSync(filePath, now, now);
      console.log(`Updated timestamp for ${file}`);
    }
  });
}

console.log('Cache cleared successfully!');
