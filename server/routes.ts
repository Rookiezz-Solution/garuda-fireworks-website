import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

const DEMO_PRODUCTS = [
  {
    name: "Red Ruby Sparklers",
    category: "Sparklers",
    price: 150,
    image: "https://images.unsplash.com/photo-1541846445940-025a1b32ba3a?auto=format&fit=crop&q=80&w=800",
    description: "Extra long, bright red sparklers perfect for kids and adults. Burns for 2 minutes with vibrant ruby colors.",
    safety: "Hold at arm's length. Keep away from face and clothing. Do not touch the hot wire after use."
  },
  {
    name: "Golden Shower Sparklers",
    category: "Sparklers",
    price: 180,
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=800",
    description: "Classic golden sparklers emitting a thick shower of beautiful golden sparks.",
    safety: "Use under adult supervision. Dispose of safely in a bucket of water or sand."
  },
  {
    name: "Thunderbolt Rockets",
    category: "Rockets",
    price: 450,
    image: "https://images.unsplash.com/photo-1533088219468-b71569611b85?auto=format&fit=crop&q=80&w=800",
    description: "High-flying rockets that burst with a thunderous boom and a giant colorful spread in the night sky.",
    safety: "Launch from a stable bottle or pipe stuck firmly into the ground. Stand back at least 15 meters."
  },
  {
    name: "Whistling Moon Travelers",
    category: "Rockets",
    price: 350,
    image: "https://images.unsplash.com/photo-1498622205843-3b0ac17f8bba?auto=format&fit=crop&q=80&w=800",
    description: "These rockets shoot up with a loud whistling sound before popping with colorful stars.",
    safety: "Ensure clear overhead area before launch. Do not hold in hand to ignite."
  },
  {
    name: "Jumbo Flower Pots",
    category: "Flower Pots",
    price: 300,
    image: "https://images.unsplash.com/photo-1513997782163-95669b7bbdf0?auto=format&fit=crop&q=80&w=800",
    description: "Classic cone-shaped flower pots that erupt into a massive fountain of golden and silver sparks.",
    safety: "Place on a flat, even surface. Light the tip and quickly move back 5 meters."
  },
  {
    name: "Color Changing Fountains",
    category: "Flower Pots",
    price: 250,
    image: "https://images.unsplash.com/photo-1535560668045-8c7694bf6e72?auto=format&fit=crop&q=80&w=800",
    description: "A spectacular fountain that transitions through five different bright colors.",
    safety: "Do not hold in hands. Place firmly on the ground."
  },
  {
    name: "Giant Ground Chakkars",
    category: "Ground Chakkars",
    price: 200,
    image: "https://images.unsplash.com/photo-1543660506-69ee62bb5dbb?auto=format&fit=crop&q=80&w=800",
    description: "Large, fast-spinning wheels that create a beautiful spiral of colors on the ground.",
    safety: "Use only on flat, hard surfaces. Stand at least 2 meters away once lit."
  },
  {
    name: "Whizzing Ground Spinners",
    category: "Ground Chakkars",
    price: 180,
    image: "https://images.unsplash.com/photo-1605335198463-dbb49767851d?auto=format&fit=crop&q=80&w=800",
    description: "Spinners that rotate rapidly while emitting a whistling sound and green sparks.",
    safety: "Light the edge and step back. Never try to pick it up while spinning."
  },
  {
    name: "Family Assortment Gift Box",
    category: "Gift Boxes",
    price: 1500,
    image: "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&q=80&w=800",
    description: "A large combo box containing a mix of sparklers, flower pots, chakkars, and small aerial items.",
    safety: "Follow instructions on individual items inside the box."
  },
  {
    name: "Kids Special Box",
    category: "Gift Boxes",
    price: 800,
    image: "https://images.unsplash.com/photo-1544778107-160b73c9dbcb?auto=format&fit=crop&q=80&w=800",
    description: "Safe, low-noise items specially curated for young children. Includes sparklers, safe fountains, and roll caps.",
    safety: "Adult supervision strictly required at all times."
  },
  {
    name: "Mega Sky Shots (12 Pack)",
    category: "Gift Boxes",
    price: 2200,
    image: "https://images.unsplash.com/photo-1533088219468-b71569611b85?auto=format&fit=crop&q=80&w=800",
    description: "12 individual tubes that shoot high into the sky, creating massive, colorful bursts. Perfect for the finale.",
    safety: "Place tube on stable ground. Light fuse and retreat immediately."
  },
  {
    name: "Crackling Sparklers",
    category: "Sparklers",
    price: 160,
    image: "https://images.unsplash.com/photo-1498622205843-3b0ac17f8bba?auto=format&fit=crop&q=80&w=800",
    description: "These sparklers pop and crackle while burning, adding a fun auditory effect to the visual sparks.",
    safety: "Hold at arm's length. Avoid loose clothing when lighting."
  }
];

async function seedDatabase() {
  try {
    const existing = await storage.getProducts();
    if (existing.length === 0) {
      console.log("Seeding database with demo products...");
      for (const product of DEMO_PRODUCTS) {
        await storage.insertProduct(product);
      }
      console.log("Database seeded.");
    }
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Seed the database
  seedDatabase();

  app.get(api.products.list.path, async (req, res) => {
    let products = await storage.getProducts();
    
    // Simple filter logic
    const { search, category } = req.query;
    
    if (category) {
      products = products.filter(p => p.category.toLowerCase() === String(category).toLowerCase());
    }
    
    if (search) {
      const searchLower = String(search).toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(searchLower) || 
        p.description.toLowerCase().includes(searchLower)
      );
    }
    
    res.json(products);
  });

  app.get(api.products.get.path, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(404).json({ message: "Invalid ID" });
    }
    
    const product = await storage.getProduct(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    res.json(product);
  });

  return httpServer;
}