import fs from "fs";
import path from "path";
import sharp from "sharp";

const SOURCE_PATH = "C:/Users/EsDrAs/.gemini/antigravity/brain/85e2a31b-028a-47a4-90fe-2b58feed83cf/.user_uploaded/media_1794024064431_62402738.jpg";
const PUBLIC_DIR = path.resolve("public");

async function generateAll() {
  console.log("Reading source image from:", SOURCE_PATH);
  const sourceBuf = fs.readFileSync(SOURCE_PATH);

  // Save original copy to public/logo-original.jpg
  fs.writeFileSync(path.join(PUBLIC_DIR, "logo-original.jpg"), sourceBuf);

  // Analyze raw pixels to find tight bounding box
  const { data, info } = await sharp(sourceBuf).raw().toBuffer({ resolveWithObject: true });
  let minX = info.width, maxX = 0, minY = info.height, maxY = 0;

  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const idx = (y * info.width + x) * info.channels;
      const lum = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
      if (lum < 235) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  const cropW = maxX - minX + 1;
  const cropH = maxY - minY + 1;
  console.log(`Bounding box: x=[${minX}..${maxX}], y=[${minY}..${maxY}], width=${cropW}, height=${cropH}`);

  const croppedEmblem = await sharp(sourceBuf)
    .extract({ left: minX, top: minY, width: cropW, height: cropH })
    .toBuffer();

  const targetSize = 1024;
  const paddingRatio = 0.86; // Clean margin around emblem
  const scale = (targetSize * paddingRatio) / Math.max(cropW, cropH);
  const newW = Math.round(cropW * scale);
  const newH = Math.round(cropH * scale);

  const resized = await sharp(croppedEmblem)
    .resize(newW, newH, { kernel: sharp.kernel.lanczos3 })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const offsetX = Math.round((targetSize - newW) / 2);
  const offsetY = Math.round((targetSize - newH) / 2);

  // 1) Dark version (for light backgrounds): Charcoal lines (#14161A / rgb 20, 22, 26)
  const darkBuf = Buffer.alloc(targetSize * targetSize * 4, 0);
  // 2) White version (for dark backgrounds): White lines (#FFFFFF / rgb 255, 255, 255)
  const whiteBuf = Buffer.alloc(targetSize * targetSize * 4, 0);

  const rData = resized.data;
  const rCh = resized.info.channels;
  const rW = resized.info.width;
  const rH = resized.info.height;

  for (let y = 0; y < rH; y++) {
    for (let x = 0; x < rW; x++) {
      const inIdx = (y * rW + x) * rCh;
      const r = rData[inIdx];
      const g = rData[inIdx + 1];
      const b = rData[inIdx + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;

      let alpha = 0;
      if (lum < 245) {
        // Linear fade with slight gamma correction for crisp stroke preservation
        const t = Math.max(0, Math.min(1, (245 - lum) / 245));
        alpha = Math.round(Math.pow(t, 0.92) * 255);
      }

      if (alpha > 0) {
        const outIdx = ((offsetY + y) * targetSize + (offsetX + x)) * 4;

        // Dark version
        darkBuf[outIdx] = 20;     // R
        darkBuf[outIdx + 1] = 22; // G
        darkBuf[outIdx + 2] = 26; // B
        darkBuf[outIdx + 3] = alpha;

        // White version
        whiteBuf[outIdx] = 255;
        whiteBuf[outIdx + 1] = 255;
        whiteBuf[outIdx + 2] = 255;
        whiteBuf[outIdx + 3] = alpha;
      }
    }
  }

  // Save 1024x1024 master transparent PNG
  const logoPath = path.join(PUBLIC_DIR, "logo.png");
  await sharp(darkBuf, {
    raw: { width: targetSize, height: targetSize, channels: 4 },
  })
    .png({ compressionLevel: 9 })
    .toFile(logoPath);
  console.log("Saved:", logoPath);

  // Save 1024x1024 white logo
  const logoWhitePath = path.join(PUBLIC_DIR, "logo-white.png");
  await sharp(whiteBuf, {
    raw: { width: targetSize, height: targetSize, channels: 4 },
  })
    .png({ compressionLevel: 9 })
    .toFile(logoWhitePath);
  console.log("Saved:", logoWhitePath);

  // Save favicon.png (512x512)
  const faviconPath = path.join(PUBLIC_DIR, "favicon.png");
  await sharp(logoPath)
    .resize(512, 512, { kernel: sharp.kernel.lanczos3 })
    .png({ compressionLevel: 9 })
    .toFile(faviconPath);
  console.log("Saved:", faviconPath);

  // Save icon.png (512x512)
  const iconPath = path.join(PUBLIC_DIR, "icon.png");
  await sharp(logoPath)
    .resize(512, 512, { kernel: sharp.kernel.lanczos3 })
    .png({ compressionLevel: 9 })
    .toFile(iconPath);
  console.log("Saved:", iconPath);

  // Save favicon-32x32.png
  const fav32Path = path.join(PUBLIC_DIR, "favicon-32x32.png");
  await sharp(logoPath)
    .resize(32, 32, { kernel: sharp.kernel.lanczos3 })
    .png()
    .toFile(fav32Path);
  console.log("Saved:", fav32Path);

  // Save favicon-16x16.png
  const fav16Path = path.join(PUBLIC_DIR, "favicon-16x16.png");
  await sharp(logoPath)
    .resize(16, 16, { kernel: sharp.kernel.lanczos3 })
    .png()
    .toFile(fav16Path);
  console.log("Saved:", fav16Path);

  // Save apple-touch-icon.png (180x180)
  const applePath = path.join(PUBLIC_DIR, "apple-touch-icon.png");
  await sharp(logoPath)
    .resize(180, 180, { kernel: sharp.kernel.lanczos3 })
    .png()
    .toFile(applePath);
  console.log("Saved:", applePath);

  // Create favicon.ico (16, 32, 48)
  const b16 = await sharp(logoPath).resize(16, 16).png().toBuffer();
  const b32 = await sharp(logoPath).resize(32, 32).png().toBuffer();
  const b48 = await sharp(logoPath).resize(48, 48).png().toBuffer();
  await writeIcoFile(
    [
      { width: 16, height: 16, buffer: b16 },
      { width: 32, height: 32, buffer: b32 },
      { width: 48, height: 48, buffer: b48 },
    ],
    path.join(PUBLIC_DIR, "favicon.ico")
  );
  console.log("Saved: public/favicon.ico");

  // Clean test files
  if (fs.existsSync("public/test-logo.png")) fs.unlinkSync("public/test-logo.png");
  if (fs.existsSync("public/test-favicon.ico")) fs.unlinkSync("public/test-favicon.ico");

  console.log("All logo assets generated successfully!");
}

async function writeIcoFile(pngBuffers, outPath) {
  const count = pngBuffers.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // icon type
  header.writeUInt16LE(count, 4); // count

  let offset = 6 + count * 16;
  const entries = [];
  for (const { width, height, buffer } of pngBuffers) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(width >= 256 ? 0 : width, 0);
    entry.writeUInt8(height >= 256 ? 0 : height, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4); // planes
    entry.writeUInt16LE(32, 6); // bpp
    entry.writeUInt32LE(buffer.length, 8); // size
    entry.writeUInt32LE(offset, 12); // offset
    entries.push(entry);
    offset += buffer.length;
  }

  const allBuffers = [header, ...entries, ...pngBuffers.map((b) => b.buffer)];
  fs.writeFileSync(outPath, Buffer.concat(allBuffers));
}

generateAll().catch((err) => {
  console.error("Error generating logos:", err);
  process.exit(1);
});

