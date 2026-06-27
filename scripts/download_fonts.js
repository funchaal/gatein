const fs = require('fs');
const path = require('path');
const https = require('https');

const workspaceDir = path.join(__dirname, '..');
const fontsDir = path.join(workspaceDir, 'assets', 'fonts');

// Ensure fonts directory exists
if (!fs.existsSync(fontsDir)) {
  fs.mkdirSync(fontsDir, { recursive: true });
}

// 1. Delete previous font files if they exist
console.log('Cleaning up previous font files...');
if (fs.existsSync(fontsDir)) {
  const existingFiles = fs.readdirSync(fontsDir);
  for (const file of existingFiles) {
    if ((file.startsWith('Inter-') || file.startsWith('NotoSans-')) && file.endsWith('.ttf')) {
      fs.unlinkSync(path.join(fontsDir, file));
      console.log(`Removed ${file}`);
    }
  }
}

// 2. Noto Sans Font weights to download
const fontFiles = [
  'NotoSans-Regular.ttf',
  'NotoSans-Italic.ttf',
  'NotoSans-Medium.ttf',
  'NotoSans-MediumItalic.ttf',
  'NotoSans-SemiBold.ttf',
  'NotoSans-SemiBoldItalic.ttf',
  'NotoSans-Bold.ttf',
  'NotoSans-BoldItalic.ttf'
];

// Candidates for URL paths (we will try them in order until one succeeds)
const getUrlCandidates = (filename) => [
  `https://raw.githubusercontent.com/notofonts/noto-fonts/main/hinted/ttf/NotoSans/${filename}`,
  `https://raw.githubusercontent.com/notofonts/noto-fonts/master/hinted/ttf/NotoSans/${filename}`,
  `https://raw.githubusercontent.com/googlefonts/noto-fonts/master/hinted/ttf/NotoSans/${filename}`,
  `https://raw.githubusercontent.com/google/fonts/main/ofl/notosans/static/${filename}`,
  `https://raw.githubusercontent.com/google/fonts/main/ofl/notosans/${filename}`
];

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        // Follow redirect
        downloadFile(response.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`Status ${response.statusCode}`));
        return;
      }
      
      const file = fs.createWriteStream(dest);
      response.pipe(file);
      
      file.on('finish', () => {
        file.close(() => {
          resolve();
        });
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function main() {
  console.log('Downloading Noto Sans font weights...');
  
  for (const filename of fontFiles) {
    const dest = path.join(fontsDir, filename);
    const candidates = getUrlCandidates(filename);
    let success = false;
    
    for (const url of candidates) {
      console.log(`Trying to download ${filename} from: ${url}`);
      try {
        await downloadFile(url, dest);
        console.log(`Successfully downloaded ${filename}!`);
        success = true;
        break; // Success, go to next font file
      } catch (e) {
        console.log(`Failed candidate: ${e.message}`);
      }
    }
    
    if (!success) {
      console.error(`ERROR: Could not download ${filename} from any candidate URL.`);
    }
  }
  
  console.log('Noto Sans download process completed.');
}

main();
