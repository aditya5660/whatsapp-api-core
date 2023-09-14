const fs = require('fs');
const path = require('path');

// Get the directory of the current module (assuming it's in the project root).
const currentModuleDir = __dirname;

// Define a function to find the project's root directory.
function findProjectRoot(dir) {
  const rootMarkerFiles = ['package.json', '.git']; // Add other markers as needed
  for (const marker of rootMarkerFiles) {
    const rootPath = path.join(dir, marker);
    // Check if the marker file exists in the current directory.
    if (fs.existsSync(rootPath)) {
      return dir;
    }
  }
  // If no marker files are found, go up one directory.
  const parentDir = path.dirname(dir);
  if (parentDir === dir) {
    // Reached the filesystem root, so return the current directory as fallback.
    return dir;
  }
  // Recursively search in the parent directory.
  return findProjectRoot(parentDir);
}

// Find the project's root directory.
const projectRoot = findProjectRoot(currentModuleDir);

module.exports = projectRoot;
