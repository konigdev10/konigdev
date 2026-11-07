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

  // Create Open Graph social share banner (1200x630)
  await generateOgImage(logoPath);

  // Create site.webmanifest
  generateWebManifest();

  // Clean test files
  if (fs.existsSync("public/test-logo.png")) fs.unlinkSync("public/test-logo.png");
  if (fs.existsSync("public/test-favicon.ico")) fs.unlinkSync("public/test-favicon.ico");

  console.log("All logo assets generated successfully!");
}

async function generateOgImage(logoPath) {
  const logoBuf = fs.readFileSync(logoPath);
  const logoB64 = "data:image/png;base64," + logoBuf.toString("base64");
  const width = 1200;
  const height = 630;

  const svgCard = Buffer.from(`
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FFFFFF" />
          <stop offset="50%" stop-color="#F8FAFD" />
          <stop offset="100%" stop-color="#EDF2F7" />
        </linearGradient>
        <radialGradient id="halo" cx="75%" cy="35%" r="50%">
          <stop offset="0%" stop-color="rgba(255,255,255,0.95)" />
          <stop offset="100%" stop-color="rgba(237,242,247,0)" />
        </radialGradient>
        <filter id="cardShadow" x="-5%" y="-5%" width="110%" height="110%">
          <feDropShadow dx="0" dy="16" stdDeviation="32" flood-color="#788291" flood-opacity="0.15" />
        </filter>
      </defs>

      <rect width="${width}" height="${height}" fill="url(#bg)" />
      <circle cx="900" cy="220" r="380" fill="url(#halo)" />

      <rect x="36" y="36" width="1128" height="558" rx="32" fill="none" stroke="rgba(34,37,42,0.08)" stroke-width="1.5" />

      <g transform="translate(96, 175)">
        <rect x="-16" y="-16" width="312" height="312" rx="36" fill="#FFFFFF" stroke="rgba(34,37,42,0.08)" stroke-width="1.5" filter="url(#cardShadow)" />
        <image href="${logoB64}" x="0" y="0" width="280" height="280" />
      </g>

      <g transform="translate(440, 180)">
        <text x="0" y="40" font-family="'JetBrains Mono', monospace, system-ui" font-size="16" font-weight="600" letter-spacing="4" fill="#6B7480">
          PORTFOLIO OFFICIEL • BRAZZAVILLE
        </text>

        <text x="0" y="115" font-family="'Syne', 'Bricolage Grotesque', sans-serif, system-ui" font-size="64" font-weight="900" letter-spacing="-1" fill="#14161A">
          KoniG<tspan fill="#4A5663">.dev</tspan>
        </text>

        <text x="0" y="175" font-family="'Plus Jakarta Sans', sans-serif, system-ui" font-size="28" font-weight="700" fill="#22252A">
          Esdras Thychel MBOULOUKOUE
        </text>
        <text x="0" y="215" font-family="'Plus Jakarta Sans', sans-serif, system-ui" font-size="22" font-weight="500" fill="#4A5663">
          Développeur Full-Stack &amp; Solutions IA Freelance
        </text>

        <g transform="translate(0, 260)">
          <g>
            <rect x="0" y="0" width="105" height="36" rx="10" fill="#FFFFFF" stroke="rgba(34,37,42,0.1)" stroke-width="1" />
            <text x="52" y="23" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="13" font-weight="600" fill="#22252A">Next.js 14</text>
          </g>
          <g transform="translate(117, 0)">
            <rect x="0" y="0" width="115" height="36" rx="10" fill="#FFFFFF" stroke="rgba(34,37,42,0.1)" stroke-width="1" />
            <text x="57" y="23" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="13" font-weight="600" fill="#22252A">TypeScript</text>
          </g>
          <g transform="translate(244, 0)">
            <rect x="0" y="0" width="95" height="36" rx="10" fill="#FFFFFF" stroke="rgba(34,37,42,0.1)" stroke-width="1" />
            <text x="47" y="23" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="13" font-weight="600" fill="#22252A">Flutter</text>
          </g>
          <g transform="translate(351, 0)">
            <rect x="0" y="0" width="105" height="36" rx="10" fill="#FFFFFF" stroke="rgba(34,37,42,0.1)" stroke-width="1" />
            <text x="52" y="23" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="13" font-weight="600" fill="#22252A">Supabase</text>
          </g>
          <g transform="translate(468, 0)">
            <rect x="0" y="0" width="155" height="36" rx="10" fill="#FFFFFF" stroke="rgba(34,37,42,0.1)" stroke-width="1" />
            <text x="77" y="23" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="13" font-weight="600" fill="#22252A">Agents IA &amp; n8n</text>
          </g>
        </g>
      </g>
    </svg>
  `);

  const ogPath = path.join(PUBLIC_DIR, "og-image.png");
  await sharp(svgCard).png({ quality: 95 }).toFile(ogPath);
  console.log("Saved: public/og-image.png");
}

function generateWebManifest() {
  const manifest = {
    name: "KoniG.dev — Esdras Thychel MBOULOUKOUE",
    short_name: "KoniG.dev",
    description:
      "Portfolio d'Esdras Thychel MBOULOUKOUE (KoniG.dev), développeur full-stack et IA freelance.",
    start_url: "/",
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: "#14161A",
    icons: [
      {
        src: "/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        src: "/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable",
      },
    ],
  };

  fs.writeFileSync(
    path.join(PUBLIC_DIR, "site.webmanifest"),
    JSON.stringify(manifest, null, 2)
  );
  console.log("Saved: public/site.webmanifest");
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

