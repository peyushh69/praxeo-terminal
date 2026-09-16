const sharp = require('sharp');
const fs = require('fs');

async function run() {
  const files = ['public/pwa-192x192.png', 'public/pwa-512x512.png', 'public/pwa-maskable-512x512.png', 'public/apple-touch-icon.png'];
  for (let file of files) {
    if (!fs.existsSync(file)) continue;
    let img = sharp(file);
    let size = 512;
    if (file.includes('192')) size = 192;
    if (file.includes('apple')) size = 180;
    
    await img.resize(size, size).png().toFile(file + '.new');
    fs.renameSync(file + '.new', file);
  }
}
run();
