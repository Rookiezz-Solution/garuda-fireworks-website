import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function getAllImageFiles(dir) {
  let results = [];
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      const subResults = await getAllImageFiles(fullPath);
      results = results.concat(subResults);
    } else if (
      item.toLowerCase().endsWith(".jpg") ||
      item.toLowerCase().endsWith(".jpeg") ||
      item.toLowerCase().endsWith(".png") ||
      item.toLowerCase().endsWith(".webp")
    ) {
      results.push(fullPath);
    }
  }
  return results;
}

async function main() {
  console.log("Starting image seeding from category folders...");

  const baseDir = path.join(__dirname, "../uploads/garuda crackers");

  if (!fs.existsSync(baseDir)) {
    console.error("❌ uploads/garuda crackers folder not found!");
    console.log("Looking in:", baseDir);
    return;
  }

  const allImages = await getAllImageFiles(baseDir);
  console.log(`Found ${allImages.length} total images`);

  const products = await prisma.product.findMany();
  console.log(`Found ${products.length} products in database`);

  const categories = await prisma.category.findMany();
  const normalize = (s) =>
    String(s || "")
      .toLowerCase()
      .replace(/×/g, "x")
      .replace(/\bstriped\b/g, "stripped")
      .replace(/\bnavrang\b/g, "navarang")
      .replace(/[^a-z0-9]+/g, "");
  const normalizedCategoryIdMap = new Map(
    categories.map((c) => [normalize(c.name), c.id]),
  );

  let matched = 0;
  const notMatched = [];

  const projectRoot = path.join(__dirname, "..");

  for (const imagePath of allImages) {
    const relFromBase = path.relative(baseDir, imagePath);
    const topFolder = relFromBase.split(path.sep)[0];
    const folderCategoryId = normalizedCategoryIdMap.get(normalize(topFolder));

    const productName = path.basename(imagePath, path.extname(imagePath)).trim();

    const candidates = folderCategoryId
      ? products.filter((p) => p.categoryId === folderCategoryId)
      : products;

    const productNameNorm = normalize(productName);
    const scoreFor = (p) => {
      const pn = normalize(p.name);
      if (!pn || !productNameNorm) return 0;
      if (pn === productNameNorm) return 100;
      const aInB = pn.includes(productNameNorm);
      const bInA = productNameNorm.includes(pn);
      if (!aInB && !bInA) return 0;
      const minLen = Math.min(pn.length, productNameNorm.length);
      const maxLen = Math.max(pn.length, productNameNorm.length);
      const ratio = maxLen ? minLen / maxLen : 0;
      let score = 50 + ratio * 20;
      if (pn.startsWith(productNameNorm) || productNameNorm.startsWith(pn)) score += 5;
      return score;
    };

    let product = null;
    let bestScore = 0;
    for (const p of candidates) {
      const s = scoreFor(p);
      if (s > bestScore) {
        bestScore = s;
        product = p;
      }
    }

    if (!product && folderCategoryId) {
      for (const p of products) {
        const s = scoreFor(p);
        if (s > bestScore) {
          bestScore = s;
          product = p;
        }
      }
    }

    if (product) {
      const relativePath = path.relative(projectRoot, imagePath).replace(/\\/g, "/");
      const imageUrl = `/${relativePath}`;

      await prisma.image.deleteMany({ where: { productId: product.id } });
      await prisma.image.create({
        data: {
          productId: product.id,
          imageUrl,
          isActive: true,
        },
      });

      console.log(`✅ "${productName}" → "${product.name}"`);
      matched++;
    } else {
      notMatched.push(productName);
      console.log(`❌ No match: "${productName}"`);
    }
  }

  console.log("\n========== SUMMARY ==========");
  console.log(`✅ Matched: ${matched}`);
  console.log(`❌ Not matched: ${notMatched.length}`);
  if (notMatched.length > 0) {
    console.log("\nUnmatched images:");
    notMatched.forEach((n) => console.log(`   - ${n}`));
  }
  console.log("==============================");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
