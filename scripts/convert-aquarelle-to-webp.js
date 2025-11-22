import sharp from "sharp";
import { readdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

const aquarelleDir = join(process.cwd(), "public", "images", "aquarelle");
const colors = ["blau", "rot", "gelb", "grün"];

async function convertImages() {
  console.log("🎨 Converting aquarelle PNG images to WebP (85% quality)...\n");

  let totalConverted = 0;
  let totalSkipped = 0;

  for (const color of colors) {
    const colorDir = join(aquarelleDir, color);
    
    if (!existsSync(colorDir)) {
      console.warn(`⚠️  Directory not found: ${colorDir}`);
      continue;
    }

    const files = await readdir(colorDir);
    const pngFiles = files.filter((file) => file.endsWith(".png"));

    console.log(`📁 Processing ${color} (${pngFiles.length} files)...`);

    for (const pngFile of pngFiles) {
      const inputPath = join(colorDir, pngFile);
      const outputPath = join(colorDir, pngFile.replace(".png", ".webp"));

      // Skip if WebP already exists
      if (existsSync(outputPath)) {
        console.log(`   ⏭️  Skipped ${pngFile} (WebP already exists)`);
        totalSkipped++;
        continue;
      }

      try {
        await sharp(inputPath)
          .webp({ quality: 85 })
          .toFile(outputPath);

        const inputStats = await import("fs/promises").then((fs) =>
          fs.stat(inputPath)
        );
        const outputStats = await import("fs/promises").then((fs) =>
          fs.stat(outputPath)
        );
        const reduction = (
          ((inputStats.size - outputStats.size) / inputStats.size) *
          100
        ).toFixed(1);

        console.log(
          `   ✅ Converted ${pngFile} → ${pngFile.replace(".png", ".webp")} (${reduction}% smaller)`
        );
        totalConverted++;
      } catch (error) {
        console.error(`   ❌ Error converting ${pngFile}:`, error.message);
      }
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log(`✅ Conversion complete!`);
  console.log(`   Converted: ${totalConverted} files`);
  console.log(`   Skipped: ${totalSkipped} files`);
  console.log("=".repeat(50));
}

convertImages().catch(console.error);

