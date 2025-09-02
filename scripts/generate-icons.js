const fs = require('fs');
const path = require('path');

// 簡単なアイコン生成（実際の環境ではSharpやCanvasを使用）
function generateIcon(size) {
  const svg = `<svg width="${size}" height="${size}" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" rx="${size * 0.25}" fill="#000000"/>
  <circle cx="${size * 0.5}" cy="${size * 0.5}" r="${size * 0.35}" fill="#ffffff"/>
  <path d="M ${size * 0.35} ${size * 0.35} L ${size * 0.65} ${size * 0.35} L ${size * 0.65} ${size * 0.65} L ${size * 0.35} ${size * 0.65} Z" fill="#000000"/>
  <circle cx="${size * 0.5}" cy="${size * 0.5}" r="${size * 0.12}" fill="#ffffff"/>
  <path d="M ${size * 0.43} ${size * 0.43} L ${size * 0.57} ${size * 0.43} L ${size * 0.57} ${size * 0.57} L ${size * 0.43} ${size * 0.57} Z" fill="#000000"/>
  <circle cx="${size * 0.5}" cy="${size * 0.5}" r="${size * 0.04}" fill="#ffffff"/>
</svg>`;
  
  return svg;
}

// アイコンファイルを生成
const publicDir = path.join(__dirname, '../public');
const icon192 = generateIcon(192);
const icon512 = generateIcon(512);

// SVGファイルとして保存（PNGの代わり）
fs.writeFileSync(path.join(publicDir, 'icon-192x192.svg'), icon192);
fs.writeFileSync(path.join(publicDir, 'icon-512x512.svg'), icon512);

console.log('アイコンファイルが生成されました！');
console.log('注意: 実際のPWAでは、SVGからPNGファイルを生成することをお勧めします。');
console.log('Sharpライブラリを使用して高品質なPNGファイルを生成できます。');
