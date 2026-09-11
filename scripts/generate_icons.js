/**
 * Pure Node.js PNG Generator (Zero External Dependencies)
 * Generates clean, crisp extension icons in 16x16, 32x32, 48x48, and 128x128.
 */

const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

// CRC32 table & calculation for PNG chunks
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function createChunk(type, data) {
  const typeBuf = Buffer.from(type, "ascii");
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);

  const crcBuf = Buffer.alloc(4);
  const toCrc = Buffer.concat([typeBuf, data]);
  crcBuf.writeUInt32BE(crc32(toCrc), 0);

  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function generatePng(size) {
  const width = size;
  const height = size;

  // Raw RGBA scanlines: 1 byte filter (0) + 4 bytes per pixel
  const rawBytesPerLine = 1 + width * 4;
  const rawBuffer = Buffer.alloc(rawBytesPerLine * height);

  const radius = size * 0.22;
  const cx = width / 2;
  const cy = height / 2;

  for (let y = 0; y < height; y++) {
    const lineOffset = y * rawBytesPerLine;
    rawBuffer[lineOffset] = 0; // Filter: None

    for (let x = 0; x < width; x++) {
      const pxOffset = lineOffset + 1 + x * 4;

      // Rounded rectangle background
      const dx = Math.abs(x - cx) - (cx - radius);
      const dy = Math.abs(y - cy) - (cy - radius);
      const inCorner = dx > 0 && dy > 0;
      const dist = inCorner ? Math.sqrt(dx * dx + dy * dy) : 0;

      if (inCorner && dist > radius) {
        // Transparent outside rounded corner
        rawBuffer[pxOffset] = 0;
        rawBuffer[pxOffset + 1] = 0;
        rawBuffer[pxOffset + 2] = 0;
        rawBuffer[pxOffset + 3] = 0;
        continue;
      }

      // Smooth background gradient (#0f172a to #0284c7)
      const gradT = (x + y) / (width + height);
      let r = Math.round(15 + (2 - 15) * gradT);
      let g = Math.round(23 + (132 - 23) * gradT);
      let b = Math.round(42 + (199 - 42) * gradT);
      let a = 255;

      // Draw stylized "AI" / translation emblem
      // Center icon: circle/globe accent with central symbol
      const distFromCenter = Math.sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy));
      const ringR = size * 0.35;
      const ringThickness = Math.max(1, size * 0.08);

      if (Math.abs(distFromCenter - ringR) <= ringThickness / 2) {
        // Cyan accent ring
        r = 56;
        g = 189;
        b = 248;
      } else if (distFromCenter < ringR) {
        // Inner glyph core
        const nx = (x - cx) / (size * 0.28);
        const ny = (y - cy) / (size * 0.28);

        // Letter "A" shape
        const isA = (Math.abs(Math.abs(nx) - (ny + 0.6) * 0.5) < 0.18 && ny > -0.7 && ny < 0.6) ||
                    (Math.abs(ny - 0.1) < 0.12 && Math.abs(nx) < 0.4);

        if (isA) {
          r = 255;
          g = 255;
          b = 255;
        } else {
          // Slight glow inside
          r = Math.min(255, r + 25);
          g = Math.min(255, g + 40);
          b = Math.min(255, b + 60);
        }
      }

      rawBuffer[pxOffset] = r;
      rawBuffer[pxOffset + 1] = g;
      rawBuffer[pxOffset + 2] = b;
      rawBuffer[pxOffset + 3] = a;
    }
  }

  // Header chunk (IHDR)
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // color type: RGBA
  ihdr[10] = 0; // compression: deflate
  ihdr[11] = 0; // filter method
  ihdr[12] = 0; // interlace: none

  // Compressed image data chunk (IDAT)
  const idatData = zlib.deflateSync(rawBuffer);

  // File structure: Signature + IHDR + IDAT + IEND
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdrChunk = createChunk("IHDR", ihdr);
  const idatChunk = createChunk("IDAT", idatData);
  const iendChunk = createChunk("IEND", Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const iconsDir = path.join(__dirname, "..", "icons");
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

const sizes = [16, 32, 48, 128];
for (const size of sizes) {
  const png = generatePng(size);
  const outPath = path.join(iconsDir, `icon${size}.png`);
  fs.writeFileSync(outPath, png);
  console.log(`Generated: icons/icon${size}.png (${size}x${size}, ${png.length} bytes)`);
}

console.log("All icons generated successfully!");
