/**
 * Generates favicon PNGs from public/favicon.svg using sharp.
 * Outputs: favicon-32.png, favicon-192.png, apple-touch-icon.png (180), icon-512.png
 */
import sharp from "sharp";
import { readFile } from "node:fs/promises";

const svg = await readFile("/home/z/my-project/public/favicon.svg");

const targets = [
  { file: "favicon-32.png", size: 32 },
  { file: "favicon-192.png", size: 192 },
  { file: "apple-touch-icon.png", size: 180, bg: "#ffffff" },
  { file: "icon-512.png", size: 512 },
];

for (const t of targets) {
  const pipeline = sharp(svg, { density: 512 }).resize(t.size, t.size);
  if (t.bg) {
    await pipeline.flatten({ background: t.bg }).png().toFile(`/home/z/my-project/public/${t.file}`);
  } else {
    await pipeline.png().toFile(`/home/z/my-project/public/${t.file}`);
  }
  console.log("wrote", t.file);
}
