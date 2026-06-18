import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("products").order("asc").collect();
  },
});

export const toggleStock = mutation({
  args: { productId: v.id("products"), inStock: v.boolean() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.productId, {
      inStock: args.inStock,
      updatedAt: Date.now(),
    });
  },
});

// Run once from admin to seed the product list from the hardcoded order form
export const seedProducts = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("products").collect();
    if (existing.length > 0) return { seeded: false, count: existing.length };

    const products = [
      { name: "Chilli-Käse",      price: 1750, unit: "kg",   category: "Sausages",          displayOrder: 1 },
      { name: "Käse Krainer",     price: 1700, unit: "kg",   category: "Sausages",          displayOrder: 2 },
      { name: "4x4 Frank",        price: 1500, unit: "kg",   category: "Sausages",          displayOrder: 3 },
      { name: "Chilli Banger",    price: 1550, unit: "kg",   category: "Sausages",          displayOrder: 4 },
      { name: "Sauerkraut",       price: 500,  unit: "jar",  category: "Cured & Fermented", displayOrder: 5 },
      { name: "Biltong",          price: 275,  unit: "100g", category: "Cured & Fermented", displayOrder: 6 },
      { name: "Classic Leberkäse",price: 1500, unit: "kg",   category: "Leberkäse",         displayOrder: 7 },
      { name: "Chilli Leberkäse", price: 1550, unit: "kg",   category: "Leberkäse",         displayOrder: 8 },
      { name: "Käse-Leberkäse",   price: 1700, unit: "kg",   category: "Leberkäse",         displayOrder: 9 },
    ];

    for (const p of products) {
      await ctx.db.insert("products", { ...p, inStock: true, updatedAt: Date.now() });
    }

    return { seeded: true, count: products.length };
  },
});
