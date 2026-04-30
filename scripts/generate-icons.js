const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

// CRC32 테이블
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = (c & 1) ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (const b of buf) crc = crcTable[(crc ^ b) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function pngChunk(type, data) {
  const t = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const crcVal = Buffer.alloc(4);
  crcVal.writeUInt32BE(crc32(Buffer.concat([t, data])));
  return Buffer.concat([len, t, data, crcVal]);
}

function createPNG(size, pixels) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 6; // 8-bit RGBA

  const raw = Buffer.alloc(size * (1 + size * 4));
  for (let y = 0; y < size; y++) {
    raw[y * (1 + size * 4)] = 0;
    for (let x = 0; x < size; x++) {
      const s = (y * size + x) * 4;
      const d = y * (1 + size * 4) + 1 + x * 4;
      raw[d] = pixels[s]; raw[d+1] = pixels[s+1];
      raw[d+2] = pixels[s+2]; raw[d+3] = pixels[s+3];
    }
  }

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

function lerp(a, b, t) {
  return Math.round(a * (1 - t) + b * t);
}

function generateIcon(size) {
  const pixels = new Uint8Array(size * size * 4);
  const cx = size / 2, cy = size / 2;

  // 배경: 남색 #1a2e5a
  const bgR = 0x1a, bgG = 0x2e, bgB = 0x5a;
  // 중앙 원: 붉은색 #e63946
  const rdR = 0xe6, rdG = 0x39, rdB = 0x46;
  // 문자: 흰색
  const wR = 0xff, wG = 0xff, wB = 0xff;

  const circR = size * 0.38;
  const aa = 1.5; // 안티앨리어싱 폭

  // "日" 문자 크기 (가운데 기준)
  const sw = Math.max(2, Math.round(size * 0.042)); // 획 두께
  const hw = size * 0.16; // 반폭
  const hh = size * 0.20; // 반높이

  const cx1 = cx - hw, cx2 = cx + hw;
  const cy1 = cy - hh, cy2 = cy + hh;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const dx = x - cx, dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // 배경 vs 빨간 원 (안티앨리어싱 포함)
      let r, g, b;
      if (dist >= circR + aa) {
        r = bgR; g = bgG; b = bgB;
      } else if (dist <= circR - aa) {
        r = rdR; g = rdG; b = rdB;
      } else {
        const t = (circR - dist + aa) / (aa * 2);
        r = lerp(bgR, rdR, t); g = lerp(bgG, rdG, t); b = lerp(bgB, rdB, t);
      }

      // "日" 획 그리기 (흰색)
      if (x >= cx1 && x <= cx2 && y >= cy1 && y <= cy2) {
        const onTop    = y <= cy1 + sw;
        const onBottom = y >= cy2 - sw;
        const onLeft   = x <= cx1 + sw;
        const onRight  = x >= cx2 - sw;
        const onMiddle = y >= cy - sw / 2 && y <= cy + sw / 2;

        if (onTop || onBottom || onLeft || onRight || onMiddle) {
          r = wR; g = wG; b = wB;
        }
      }

      pixels[idx]   = r;
      pixels[idx+1] = g;
      pixels[idx+2] = b;
      pixels[idx+3] = 255;
    }
  }

  return createPNG(size, pixels);
}

const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

const targets = [
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'icon-192.png',         size: 192 },
  { name: 'icon-512.png',         size: 512 },
];

for (const { name, size } of targets) {
  fs.writeFileSync(path.join(publicDir, name), generateIcon(size));
  console.log(`  생성 완료: ${name} (${size}x${size})`);
}
