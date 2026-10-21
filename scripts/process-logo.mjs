/**
 * Process the original GridKavach logo (uploaded JPG) into web assets:
 *  1. Trim white margins
 *  2. Flood-fill from edges -> transparent background (interior whites preserved)
 *  3. Split icon (shield+sun) from wordmark via a vertical white-gap scan
 *  4. Emit: full logo PNG (2x + 1x), icon-only PNG, favicon-32/192, apple-touch, icon-512
 */
import sharp from "sharp";
import { mkdirSync } from "fs";

const SRC = "/home/z/my-project/upload/GridKavach_solar_logo_design_2K_20261020185452.jpg";
const OUT_DIR = "/home/z/my-project/public/brand";
mkdirSync(OUT_DIR, { recursive: true });

const NEAR_WHITE = 238; // threshold for "background white"

async function loadRGBA() {
  const img = sharp(SRC);
  const meta = await img.metadata();
  const { data, info } = await img
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height, channels: info.channels };
}

function trimBounds(data, width, height) {
  let top = height, bottom = 0, left = width, right = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const isWhite = data[i] > NEAR_WHITE && data[i + 1] > NEAR_WHITE && data[i + 2] > NEAR_WHITE;
      if (!isWhite) {
        if (y < top) top = y;
        if (y > bottom) bottom = y;
        if (x < left) left = x;
        if (x > right) right = x;
      }
    }
  }
  return { top, bottom, left, right };
}

// Flood fill from border pixels through near-white pixels, mark as background
function markOutsideWhite(data, width, height) {
  const visited = new Uint8Array(width * height);
  const queue = [];
  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const p = y * width + x;
    if (visited[p]) return;
    const i = p * 4;
    const isWhite = data[i] > NEAR_WHITE && data[i + 1] > NEAR_WHITE && data[i + 2] > NEAR_WHITE;
    if (!isWhite) return;
    visited[p] = 1;
    queue.push(p);
  };
  for (let x = 0; x < width; x++) { push(x, 0); push(x, height - 1); }
  for (let y = 0; y < height; y++) { push(0, y); push(width - 1, y); }
  while (queue.length) {
    const p = queue.pop();
    const x = p % width, y = (p - x) / width;
    push(x + 1, y); push(x - 1, y); push(x, y + 1); push(x, y - 1);
  }
  return visited;
}

function findIconSplit(data, width, height, left, right, top, bottom) {
  // Column density of non-white pixels within content rows
  const colHas = new Uint8Array(width);
  for (let x = left; x <= right; x++) {
    for (let y = top; y <= bottom; y++) {
      const i = (y * width + x) * 4;
      if (!(data[i] > NEAR_WHITE && data[i + 1] > NEAR_WHITE && data[i + 2] > NEAR_WHITE)) {
        colHas[x] = 1;
        break;
      }
    }
  }
  // find longest run of empty columns after left (the gap between icon and wordmark)
  let bestStart = -1, bestLen = 0, runStart = -1;
  for (let x = left; x <= right + 1; x++) {
    if (x <= right && !colHas[x]) {
      if (runStart < 0) runStart = x;
    } else {
      if (runStart >= 0) {
        const len = x - runStart;
        if (len > bestLen && runStart > left + 10) { bestLen = len; bestStart = runStart; }
        runStart = -1;
      }
    }
  }
  return bestStart; // first empty column of the widest gap
}

const { data, width, height } = await loadRGBA();
console.log("source:", width, "x", height);

const bounds = trimBounds(data, width, height);
console.log("content bounds:", bounds);

const outside = markOutsideWhite(data, width, height);
// Apply transparency for outside-white + copy content region
const out = Buffer.from(data);
for (let p = 0; p < width * height; p++) {
  if (outside[p]) out[p * 4 + 3] = 0;
}
const cw = bounds.right - bounds.left + 1;
const ch = bounds.bottom - bounds.top + 1;
const content = await sharp(out, { raw: { width, height, channels: 4 } })
  .extract({ left: bounds.left, top: bounds.top, width: cw, height: ch })
  .png()
  .toBuffer();

// Full logo: 2x for crispness (target height 240 => about 2x of displayed 120)
await sharp(content).resize({ height: 240 }).png().toFile(`${OUT_DIR}/gridkavach-logo.png`);
await sharp(content).resize({ height: 480 }).png().toFile(`${OUT_DIR}/gridkavach-logo@2x.png`);
console.log("full logo saved, content:", cw, "x", ch);

// Icon split
const splitX = findIconSplit(data, width, height, bounds.left, bounds.right, bounds.top, bounds.bottom);
console.log("icon/wordmark split at source-x:", splitX);
if (splitX > 0) {
  const iconW = splitX - bounds.left;
  const icon = await sharp(content).extract({ left: 0, top: 0, width: iconW, height: ch }).png().toBuffer();
  const iconMeta = await sharp(icon).metadata();
  // square padding so the sun rays are not clipped in favicon
  const side = Math.max(iconMeta.width, iconMeta.height);
  const sq = side + Math.round(side * 0.08);
  const padded = await sharp(icon)
    .extend({ top: Math.floor((sq - iconMeta.height) / 2) + 4, bottom: Math.ceil((sq - iconMeta.height) / 2) + 4, left: Math.floor((sq - iconMeta.width) / 2) + 4, right: Math.ceil((sq - iconMeta.width) / 2) + 4, background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png().toBuffer();
  await sharp(padded).resize(512, 512).png().toFile(`${OUT_DIR}/icon-512.png`);
  await sharp(padded).resize(192, 192).png().toFile("/home/z/my-project/public/favicon-192.png");
  await sharp(padded).resize(180, 180).png().toFile("/home/z/my-project/public/apple-touch-icon.png");
  await sharp(padded).resize(64, 64).png().toFile("/home/z/my-project/public/favicon-64.png");
  await sharp(padded).resize(32, 32).png().toFile("/home/z/my-project/public/favicon-32.png");
  console.log("icon + favicon set saved; icon content:", iconMeta.width, "x", iconMeta.height);
} else {
  console.log("!! could not detect split — favicons not regenerated");
}
