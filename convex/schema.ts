import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  orders: defineTable({
    submissionId: v.string(),
    orderNumber: v.string(),
    customerName: v.string(),
    customerPhone: v.string(),
    deliveryAddress: v.string(),
    notes: v.optional(v.string()),
    items: v.array(
      v.object({
        product: v.string(),
        qty: v.number(),
        unit: v.string(),
        pricePerUnit: v.number(),
        lineTotal: v.number(),
      })
    ),
    total: v.number(),
    mpesaCode: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("delivered"),
      v.literal("cancelled")
    ),
    deliveryWeek: v.string(),
    createdAt: v.number(),
  })
    .index("by_submission_id", ["submissionId"])
    .index("by_phone", ["customerPhone"])
    .index("by_status", ["status"])
    .index("by_delivery_week", ["deliveryWeek"]),

  batches: defineTable({
    batchDate: v.string(),              // ISO date e.g. "2026-05-28"
    productNames: v.array(v.string()),  // products made in this batch
    notes: v.optional(v.string()),      // internal admin notes
    publicNote: v.optional(v.string()), // shown to customers on main site
    status: v.union(
      v.literal("scheduled"),
      v.literal("in-progress"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    createdAt: v.number(),
  })
    .index("by_date", ["batchDate"])
    .index("by_status", ["status"]),

  products: defineTable({
    name: v.string(),
    inStock: v.boolean(),
    price: v.number(),
    unit: v.string(),
    category: v.string(),
    displayOrder: v.number(),
    updatedAt: v.number(),
  })
    .index("by_name", ["name"]),
});
