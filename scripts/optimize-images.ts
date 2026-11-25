/**
 * Prepare the site's photos.
 *
 *   pnpm images
 *
 * Put originals (jpg or png, any size) in public/images/stock or
 * public/images/real. This writes a resized copy of each to the "optimized"
 * folder beside it: at most 2400px wide for hero-*, 1600px for the rest,
 * never enlarged, with all metadata (EXIF, GPS) removed. Copies that are
 * newer than their original are left alone.
 *
 * Then it writes src/data/media.generated.ts (size and blurred preview of
 * every copy). Reference the copy from `media` in src/data/site-data.ts.
 *
 * Originals are never changed and are not committed (see .gitignore): keep
 * your own backup. A checkout without originals is fine, because the data
 * file is built from the copies.
 */
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { join, resolve } from "node:path";
import sharp from "sharp";
import type { MediaFile } from "../src/data/media.generated";
import {
  BLUR_WIDTH,
  IMAGE_FOLDERS,
  isPhoto,
  JPEG_QUALITY,
  maxWidth,
  nameClashes,
  OUTPUT_FOLDER,
  outputName,
  outputSrc,
  renderGeneratedMedia,
} from "../src/lib/image-pipeline";

const root = resolve(import.meta.dirname, "..");
const imagesDir = resolve(root, "public/images");
const generatedFile = resolve(root, "src/data/media.generated.ts");

/** Photo files directly inside a folder; none if the folder does not exist. */
function photosIn(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && isPhoto(entry.name))
    .map((entry) => entry.name)
    .sort();
}

const kb = (bytes: number) => `${Math.round(bytes / 1024).toLocaleString()} KB`;

/** Writes the optimised copy of one original, unless it is already up to date. */
async function optimise(sourceDir: string, outputDir: string, name: string) {
  const source = join(sourceDir, name);
  const sourceStat = statSync(source);

  // Either extension: which one was used depends on the image's transparency.
  const existing = [true, false]
    .map((transparent) => join(outputDir, outputName(name, { transparent })))
    .find((file) => existsSync(file));
  if (existing && statSync(existing).mtimeMs >= sourceStat.mtimeMs) {
    return "skipped" as const;
  }

  const meta = await sharp(source).metadata();
  const transparent =
    meta.hasAlpha === true && !(await sharp(source).stats()).isOpaque;
  const output = join(outputDir, outputName(name, { transparent }));
  const limit = maxWidth(name);

  const pipeline = sharp(source)
    .autoOrient()
    .resize({ width: limit, withoutEnlargement: true });
  const { data, info } = await (
    transparent
      ? pipeline.png({ compressionLevel: 9 })
      : pipeline
          .flatten({ background: "#ffffff" })
          .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
  ).toBuffer({ resolveWithObject: true });

  // Already small enough, nothing to strip, right format, and re-encoding
  // would not help: keep the original's pixels.
  const keepAsIs =
    meta.autoOrient.width <= limit &&
    !meta.exif &&
    !meta.xmp &&
    !meta.iptc &&
    meta.format === (transparent ? "png" : "jpeg") &&
    data.length >= sourceStat.size;

  mkdirSync(outputDir, { recursive: true });
  if (keepAsIs) copyFileSync(source, output);
  else writeFileSync(output, data);

  const size = keepAsIs ? sourceStat.size : data.length;
  console.log(
    `  ${name}: ${kb(sourceStat.size)} → ${kb(size)}, ${info.width}×${info.height}`,
  );
  return "written" as const;
}

/** What the site needs to know about one optimised copy. */
async function describe(file: string, src: string): Promise<MediaFile> {
  const { width, height } = await sharp(file).metadata();
  const blur = await sharp(file)
    .resize({ width: BLUR_WIDTH })
    .webp({ quality: 40 })
    .toBuffer();
  return {
    src,
    width,
    height,
    blurDataURL: `data:image/webp;base64,${blur.toString("base64")}`,
  };
}

async function main() {
  const folders = IMAGE_FOLDERS.map((folder) => {
    const sourceDir = join(imagesDir, folder);
    return {
      folder,
      sourceDir,
      outputDir: join(sourceDir, OUTPUT_FOLDER),
      names: photosIn(sourceDir),
    };
  });

  const clashes = folders.flatMap(({ folder, names }) =>
    nameClashes(names).map((clash) => `${folder}: ${clash}`),
  );
  if (clashes.length > 0) {
    console.error("These originals would overwrite each other; rename one:");
    for (const clash of clashes) console.error(`  - ${clash}`);
    process.exit(1);
  }

  let written = 0;
  let skipped = 0;
  const files: MediaFile[] = [];

  for (const { folder, sourceDir, outputDir, names } of folders) {
    for (const name of names) {
      const result = await optimise(sourceDir, outputDir, name);
      if (result === "written") written++;
      else skipped++;
    }
    for (const name of photosIn(outputDir)) {
      files.push(
        await describe(join(outputDir, name), outputSrc(folder, name)),
      );
    }
  }

  writeFileSync(generatedFile, renderGeneratedMedia(files));
  console.log(
    `${written} written, ${skipped} already up to date, ${files.length} in ${generatedFile}`,
  );
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
