import { createOrderSchema } from "../validators/order.validator.js";
import { createOrder } from "../services/order.service.js";

export async function publicCreateOrder(req, res, next) {
  try {
    const parsed = createOrderSchema.safeParse({
      ...req.body,
      source: "store",
      paymentMethod: req.body?.paymentMethod || "WHATSAPP",
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
