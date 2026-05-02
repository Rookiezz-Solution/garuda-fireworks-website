import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function normalizeDescription(desc) {
  const d = String(desc || "").trim();
  if (d === "Sold per 1 Box" || d === "Sold per 1 Pkt" || d === "Sold per 1 Bag") return d;
  if (d === "Sold per 10 Box") return "Sold per 1 Box";
  if (d.toLowerCase().includes("gift box")) return "Sold per 1 Box";
  if (d.toLowerCase().includes("pkt")) return "Sold per 1 Pkt";
  if (d.toLowerCase().includes("bag")) return "Sold per 1 Bag";
  if (d.toLowerCase().includes("box")) return "Sold per 1 Box";
  return "Sold per 1 Box";
}

async function main() {
  console.log("Seeding started...");

  const hashedPassword = await bcrypt.hash("Admin1234", 10);
  await prisma.user.upsert({
    where: { email: "admin@garudafireworks.com" },
    update: {},
    create: {
      name: "Garuda Admin",
      email: "admin@garudafireworks.com",
      phone: "9952053009",
      password: hashedPassword,
      role: "admin",
      isActive: true,
    },
  });
  console.log("✅ Admin user ready");

  const categoryNames = [
    "Flash Light Crackers",
    "Ground Chakkar",
    "Flower Pots",
    "Twinkling Star",
    "Pencil",
    "Bijili Crackers",
    "Fancy Items",
    "Colour Matches",
    "Gift Box",
  ];

  const categoryMap = {};
  for (const name of categoryNames) {
    const cat = await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name, isActive: true },
    });
    categoryMap[name] = cat.id;
  }
  console.log("✅ Categories ready");

  const products = [
    { name: '2¾" Bird Crackers', actualPrice: 7, description: "Sold per 1 Pkt", categoryName: "Flash Light Crackers" },
    { name: '3½" Lakshmi Crackers', actualPrice: 12, description: "Sold per 1 Pkt", categoryName: "Flash Light Crackers" },
    { name: "4 Lakshmi Crackers", actualPrice: 18, description: "Sold per 1 Pkt", categoryName: "Flash Light Crackers" },
    { name: '4" Deluxe Gold Lakshmi', actualPrice: 30, description: "Sold per 1 Pkt", categoryName: "Flash Light Crackers" },
    { name: '5" Deluxe Lion', actualPrice: 45, description: "Sold per 1 Pkt", categoryName: "Flash Light Crackers" },
    { name: '6" Deluxe Jallikattu', actualPrice: 55, description: "Sold per 1 Pkt", categoryName: "Flash Light Crackers" },
    { name: "2 Sound Crackers", actualPrice: 35, description: "Sold per 1 Pkt", categoryName: "Flash Light Crackers" },
    { name: "Ground Chakkar Big (10 Pcs)", actualPrice: 34, description: "Sold per 1 Box", categoryName: "Ground Chakkar" },
    { name: "Ground Chakkar Asoka", actualPrice: 50, description: "Sold per 1 Box", categoryName: "Ground Chakkar" },
    { name: "Ground Chakkar Special", actualPrice: 65, description: "Sold per 1 Box", categoryName: "Ground Chakkar" },
    { name: "Ground Chakkar Deluxe", actualPrice: 110, description: "Sold per 1 Box", categoryName: "Ground Chakkar" },
    { name: "Disco Wheel", actualPrice: 70, description: "Sold per 1 Box", categoryName: "Ground Chakkar" },
    { name: "Wire Chakkar", actualPrice: 170, description: "Sold per 1 Box", categoryName: "Ground Chakkar" },
    { name: "Kuppi Special", actualPrice: 91, description: "Sold per 1 Box", categoryName: "Ground Chakkar" },
    { name: "Flower Pots Small", actualPrice: 47, description: "Sold per 1 Box", categoryName: "Flower Pots" },
    { name: "Flower Pots Big", actualPrice: 68, description: "Sold per 1 Box", categoryName: "Flower Pots" },
    { name: "Flower Pots Special", actualPrice: 82, description: "Sold per 1 Box", categoryName: "Flower Pots" },
    { name: "Flower Pots Asoka", actualPrice: 110, description: "Sold per 1 Box", categoryName: "Flower Pots" },
    { name: "Flower Pots S.Deluxe (2 Pcs)", actualPrice: 100, description: "Sold per 1 Box", categoryName: "Flower Pots" },
    { name: "Colour Koti", actualPrice: 160, description: "Sold per 1 Box", categoryName: "Flower Pots" },
    { name: "Tri Colour", actualPrice: 230, description: "Sold per 1 Box", categoryName: "Flower Pots" },
    { name: "Deluxe Colour Koti (5 Pcs)", actualPrice: 160, description: "Sold per 1 Box", categoryName: "Flower Pots" },
    { name: '1½" Twinkling Star', actualPrice: 20, description: "Sold per 1 Box", categoryName: "Twinkling Star" },
    { name: '4" Twinkling Star', actualPrice: 50, description: "Sold per 1 Box", categoryName: "Twinkling Star" },
    { name: "Jil Jil", actualPrice: 25, description: "Sold per 1 Box", categoryName: "Twinkling Star" },
    { name: "Ultra Pencil (3 Pcs)", actualPrice: 80, description: "Sold per 1 Box", categoryName: "Pencil" },
    { name: "Navarang Pencil (5 Pcs)", actualPrice: 125, description: "Sold per 1 Box", categoryName: "Pencil" },
    { name: "Pop Corn Pencil (3 Pcs)", actualPrice: 160, description: "Sold per 1 Box", categoryName: "Pencil" },
    { name: "Bijili Red Crackers", actualPrice: 33, description: "Sold per 1 Bag", categoryName: "Bijili Crackers" },
    { name: "Bijili Stripped Crackers", actualPrice: 35, description: "Sold per 1 Bag", categoryName: "Bijili Crackers" },
    { name: "Web Coin", actualPrice: 55, description: "Sold per 1 Box", categoryName: "Fancy Items" },
    { name: "Sun Light (5 Pcs)", actualPrice: 90, description: "Sold per 1 Box", categoryName: "Fancy Items" },
    { name: "Moon Light (5 Pcs)", actualPrice: 90, description: "Sold per 1 Box", categoryName: "Fancy Items" },
    { name: "Star Light (5 Pcs)", actualPrice: 90, description: "Sold per 1 Box", categoryName: "Fancy Items" },
    { name: "Emu Egg", actualPrice: 200, description: "Sold per 1 Box", categoryName: "Fancy Items" },
    { name: "Electric Stone", actualPrice: 15, description: "Sold per 1 Box", categoryName: "Fancy Items" },
    { name: "Magic Show (Currency Paper Bomb)", actualPrice: 150, description: "Sold per 1 Box", categoryName: "Fancy Items" },
    { name: "Roll Cap", actualPrice: 50, description: "Sold per 1 Box", categoryName: "Fancy Items" },
    { name: "Black Serpent", actualPrice: 45, description: "Sold per 1 Box", categoryName: "Fancy Items" },
    { name: "Mega Chittu Puttu Crackling", actualPrice: 65, description: "Sold per 1 Box", categoryName: "Fancy Items" },
    { name: "National Flag Flash Light", actualPrice: 110, description: "Sold per 1 Box", categoryName: "Fancy Items" },
    { name: "Thunder Flash Light", actualPrice: 85, description: "Sold per 1 Box", categoryName: "Fancy Items" },
    { name: "Water Queen H2O", actualPrice: 165, description: "Sold per 1 Box", categoryName: "Fancy Items" },
    { name: "Lolly Pop", actualPrice: 135, description: "Sold per 1 Box", categoryName: "Fancy Items" },
    { name: "Tin 6 Varieties", actualPrice: 93, description: "Sold per 1 Box", categoryName: "Fancy Items" },
    { name: "4x4 Wheel (5 Pcs)", actualPrice: 135, description: "Sold per 1 Box", categoryName: "Fancy Items" },
    { name: "Peacock Feathers (5 Pcs)", actualPrice: 80, description: "Sold per 1 Box", categoryName: "Fancy Items" },
    { name: "Siren (5 Pcs)", actualPrice: 165, description: "Sold per 1 Box", categoryName: "Fancy Items" },
    { name: "Bat Ball", actualPrice: 250, description: "Sold per 1 Box", categoryName: "Fancy Items" },
    { name: "Old is Gold (25 Pcs)", actualPrice: 125, description: "Sold per 1 Box", categoryName: "Fancy Items" },
    { name: "Fruit Series", actualPrice: 55, description: "Sold per 1 Box", categoryName: "Fancy Items" },
    { name: "Money Bank (3 Pcs)", actualPrice: 140, description: "Sold per 1 Box", categoryName: "Fancy Items" },
    { name: "100 Digital Wala (3 Pcs)", actualPrice: 70, description: "Sold per 1 Box", categoryName: "Fancy Items" },
    { name: "1K Digital Wala", actualPrice: 70, description: "Sold per 1 Box", categoryName: "Fancy Items" },
    { name: "10K Digital Wala", actualPrice: 210, description: "Sold per 1 Box", categoryName: "Fancy Items" },
    { name: '8" Signature', actualPrice: 160, description: "Sold per 1 Box", categoryName: "Fancy Items" },
    { name: "Sky Shot (5 Pcs)", actualPrice: 60, description: "Sold per 1 Box", categoryName: "Fancy Items" },
    { name: "Smoke Stick (10 Pcs)", actualPrice: 65, description: "Sold per 1 Box", categoryName: "Fancy Items" },
    { name: "Pubge Gun (5 Pcs)", actualPrice: 145, description: "Sold per 1 Box", categoryName: "Fancy Items" },
    { name: "Sweet Heart (5 Pcs)", actualPrice: 290, description: "Sold per 1 Box", categoryName: "Fancy Items" },
    { name: "IPL Colour Fountain", actualPrice: 55, description: "Sold per 1 Box", categoryName: "Fancy Items" },
    { name: "Racing Car (2 Pcs)", actualPrice: 220, description: "Sold per 1 Box", categoryName: "Fancy Items" },
    { name: "Sachin Colour Matches", actualPrice: 65, description: "Sold per 10 Box", categoryName: "Colour Matches" },
    { name: "Lion Colour Matches", actualPrice: 125, description: "Sold per 10 Box", categoryName: "Colour Matches" },
    { name: "Royal Colour Matches", actualPrice: 165, description: "Sold per 10 Box", categoryName: "Colour Matches" },
    { name: "Gift Box 22 Items", actualPrice: 0, description: "Assorted gift box with 22 items", categoryName: "Gift Box" },
    { name: "Gift Box 27 Items", actualPrice: 0, description: "Assorted gift box with 27 items", categoryName: "Gift Box" },
    { name: "Gift Box 30 Items", actualPrice: 0, description: "Assorted gift box with 30 items", categoryName: "Gift Box" },
    { name: "Gift Box 36 Items", actualPrice: 0, description: "Assorted gift box with 36 items", categoryName: "Gift Box" },
    { name: "Gift Box 45 Items", actualPrice: 0, description: "Assorted gift box with 45 items", categoryName: "Gift Box" },
  ];

  let count = 0;
  for (const product of products) {
    const categoryName = product.categoryName;
    await prisma.product.create({
      data: {
        name: product.name,
        description: normalizeDescription(product.description),
        actualPrice: product.actualPrice,
        offerPrice: null,
        isCoupon: false,
        couponPrice: null,
        isFeatured: false,
        isAvailable: true,
        createdBy: "system",
        modifiedBy: "system",
        categoryId: categoryMap[categoryName],
        tags: categoryName,
      },
    });
    count++;
    console.log(`✅ ${count}. ${product.name}`);
  }

  console.log(`\n🎉 Done! ${count} products seeded successfully`);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

