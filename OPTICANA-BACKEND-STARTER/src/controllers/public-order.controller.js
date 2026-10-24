import { createOrderSchema } from "../validators/order.validator.js";
import { createOrder } from "../services/order.service.js";

export async function publicCreateOrder(req, res, next) {
  try {
    const body = req.body || {};

    // Visitors only choose what they order and how to reach them. Pricing,
    // discounts, payments, due dates and links to existing customer records
    // are staff decisions, so those fields are never taken from the request.
    const parsed = createOrderSchema.safeParse({
      customer: body.customer,
      items: body.items,
      notes: typeof body.notes === "string" ? body.notes.slice(0, 1000) : undefined,
      source: "store",
      paymentMethod: "WHATSAPP",
      discount: 0,
    });

    if (!parsed.success) {
      const error = new Error("Invalid order data");
      error.statusCode = 400;
      error.code = "VALIDATION_ERROR";
      error.details = parsed.error.flatten();
      throw error;
    }

    const order = await createOrder(parsed.data, null);
    res.status(201).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
}
