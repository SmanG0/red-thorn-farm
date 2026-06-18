import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("batches").order("desc").collect();
  },
});

// Used by the main site to show upcoming batches to customers
export const listUpcoming = query({
  args: {},
  handler: async (ctx) => {
    const today = new Date().toISOString().slice(0, 10);
    const all = await ctx.db
      .query("batches")
      .withIndex("by_status", (q) => q.eq("status", "scheduled"))
      .order("asc")
      .collect();
    return all.filter((b) => b.batchDate >= today).slice(0, 8);
  },
});

export const createBatch = mutation({
  args: {
    batchDate: v.string(),
    productNames: v.array(v.string()),
    notes: v.optional(v.string()),
    publicNote: v.optional(v.string()),
    status: v.union(
      v.literal("scheduled"),
      v.literal("in-progress"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("batches", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const updateBatch = mutation({
  args: {
    batchId: v.id("batches"),
    batchDate: v.optional(v.string()),
    productNames: v.optional(v.array(v.string())),
    notes: v.optional(v.string()),
    publicNote: v.optional(v.string()),
    status: v.optional(v.union(
      v.literal("scheduled"),
      v.literal("in-progress"),
      v.literal("completed"),
      v.literal("cancelled")
    )),
  },
  handler: async (ctx, args) => {
    const { batchId, ...updates } = args;
    const patch: Record<string, unknown> = {};
    if (updates.batchDate    !== undefined) patch.batchDate    = updates.batchDate;
    if (updates.productNames !== undefined) patch.productNames = updates.productNames;
    if (updates.notes        !== undefined) patch.notes        = updates.notes;
    if (updates.publicNote   !== undefined) patch.publicNote   = updates.publicNote;
    if (updates.status       !== undefined) patch.status       = updates.status;
    await ctx.db.patch(batchId, patch);
  },
});

export const deleteBatch = mutation({
  args: { batchId: v.id("batches") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.batchId);
  },
});
