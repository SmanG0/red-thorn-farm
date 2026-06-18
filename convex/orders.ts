import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ── helpers ──────────────────────────────────────────────

function nextFriday(): string {
  const d = new Date();
  const day = d.getDay(); // 0=Sun … 6=Sat
  const daysUntilFriday = day <= 5 ? 5 - day : 6; // next Friday
  d.setDate(d.getDate() + daysUntilFriday);
  return d.toISOString().slice(0, 10); // "YYYY-MM-DD"
}

async function generateOrderNumber(ctx: any): Promise<string> {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, ""); // "20260519"
  // Count orders created today to build sequence
  const allToday = await ctx.db
    .query("orders")
    .filter((q: any) =>
      q.gte(q.field("createdAt"), new Date().setHours(0, 0, 0, 0))
    )
    .collect();
  const seq = String(allToday.length + 1).padStart(3, "0");
  return `RT-${today}-${seq}`;
}

// ── submit order (idempotent) ─────────────────────────────
export const submitOrder = mutation({
  args: {
    submissionId: v.string(),
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
  },
  handler: async (ctx, args) => {
    // ── Idempotency check ─────────────────────────────────
    // Same submissionId = same page session = return existing order, no duplicate
    const existing = await ctx.db
      .query("orders")
      .withIndex("by_submission_id", (q) =>
        q.eq("submissionId", args.submissionId)
      )
      .first();

    if (existing) {
      return {
        orderId: existing._id,
        orderNumber: existing.orderNumber,
        isDuplicate: true,
      };
    }

    // ── Soft duplicate warning ────────────────────────────
    // Same phone already has a pending order for this Friday?
    // We still allow it (customer may be adding on), but flag it.
    const deliveryWeek = nextFriday();
    const sameWeekOrder = await ctx.db
      .query("orders")
      .withIndex("by_phone", (q) => q.eq("customerPhone", args.customerPhone))
      .filter((q) =>
        q.and(
          q.eq(q.field("deliveryWeek"), deliveryWeek),
          q.eq(q.field("status"), "pending")
        )
      )
      .first();

    const orderNumber = await generateOrderNumber(ctx);

    const orderId = await ctx.db.insert("orders", {
      submissionId: args.submissionId,
      orderNumber,
      customerName: args.customerName,
      customerPhone: args.customerPhone,
      deliveryAddress: args.deliveryAddress,
      notes: args.notes,
      items: args.items,
      total: args.total,
      mpesaCode: args.mpesaCode,
      status: "pending",
      deliveryWeek,
      createdAt: Date.now(),
    });

    return {
      orderId,
      orderNumber,
      isDuplicate: false,
      existingOrderThisWeek: sameWeekOrder
        ? sameWeekOrder.orderNumber
        : null,
    };
  },
});

// ── update status (Philipp confirms/delivers from admin) ──
export const updateStatus = mutation({
  args: {
    orderId: v.id("orders"),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("delivered"),
      v.literal("cancelled")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.orderId, { status: args.status });
  },
});

// ── list orders by delivery week ──────────────────────────
export const listByWeek = query({
  args: { deliveryWeek: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("orders")
      .withIndex("by_delivery_week", (q) =>
        q.eq("deliveryWeek", args.deliveryWeek)
      )
      .order("desc")
      .collect();
  },
});

// ── list all pending orders ───────────────────────────────
export const listPending = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("orders")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .order("desc")
      .collect();
  },
});

// ── list all orders (for admin) ───────────────────────────
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("orders")
      .order("desc")
      .collect();
  },
});
