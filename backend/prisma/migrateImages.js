import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const prisma = new PrismaClient();
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(process.env.SUPABASE_URL, supabaseKey);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function getAllImages(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) {
      results = results.concat(await getAllImages(full));
    } else if (/\.(jpg|jpeg|png|webp)$/i.test(item)) {
      results.push(full);
    }
  }
  return results;
}

function normalize(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/×/g, "x")
    .replace(/\bstriped\b/g, "stripped")
    .replace(/\bnavrang\b/g, "navarang")
    .replace(/[^a-z0-9]+/g, "");
}

async function main() {
  const baseDir = path.join(__dirname, "../uploads/garuda crackers");
  const allImages = await getAllImages(baseDir);
  console.log(`Found ${allImages.length} images`);

  const products = await prisma.product.findMany();
  const categories = await prisma.category.findMany();
  const categoryIdByNorm = new Map(categories.map((c) => [normalize(c.name), c.id]));

  let uploaded = 0;

  for (const imgPath of allImages) {
    const relFromBase = path.relative(baseDir, imgPath);
    const topFolder = relFromBase.split(path.sep)[0];
    const folderCategoryId = categoryIdByNorm.get(normalize(topFolder));

    const productName = path.basename(imgPath, path.extname(imgPath)).trim();
    const productNameNorm = normalize(productName);

    const candidates = folderCategoryId
      ? products.filter((p) => p.categoryId === folderCategoryId)
      : products;

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

    if (!product || bestScore < 50) {
      console.log(`❌ No match: ${productName}`);
      continue;
    }

    try {
      const buffer = fs.readFileSync(imgPath);
      const ext = path.extname(imgPath).toLowerCase().replace(".", "") || "jpg";
      const fileName = `products/${Date.now()}-${product.id}.${ext}`;

      const { error } = await supabase.storage
        .from(process.env.SUPABASE_BUCKET)
        .upload(fileName, buffer, { contentType: `image/${ext === "jpg" ? "jpeg" : ext}`, upsert: true });
      if (error) throw error;

      const { data } = supabase.storage.from(process.env.SUPABASE_BUCKET).getPublicUrl(fileName);

      await prisma.image.deleteMany({ where: { productId: product.id } });
      await prisma.image.create({
        data: { productId: product.id, imageUrl: data.publicUrl, isActive: true },
      });

      console.log(`✅ ${product.name}`);
      uploaded++;
    } catch (err) {
      console.log(`❌ ${productName}: ${err.message}`);
    }
  }

  console.log(`\n🎉 ${uploaded} images uploaded to Supabase Storage`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
