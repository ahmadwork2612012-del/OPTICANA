import {
  listOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
} from "../services/order.service.js";

import {
  createOrderSchema,
  updateOrderStatusSchema,
} from "../validators/order.validator.js";


export async function adminListOrders(req, res, next) {
  try {
    const orders = await listOrders();
    res.json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
}


export async function adminGetOrder(req, res, next) {
  try {
    const order = await getOrderById(req.params.id);

    if (!order) {
      const error = new Error("Order not found");
      error.statusCode = 404;
      error.code = "NOT_FOUND";
      throw error;
    }

    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
}


export async function adminCreateOrder(req, res, next) {
  try {
    const parsed = createOrderSchema.safeParse(req.body);

    if (!parsed.success) {
      const error = new Error("Invalid order data");
      error.statusCode = 400;
      error.code = "VALIDATION_ERROR";
      error.details = parsed.error.flatten();
      throw error;
    }

    const order = await createOrder(
      parsed.data,
      req.user?.id
    );

    res.status(201).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
}

export async function adminUpdateOrderStatus(req, res, next) {
  try {
    const parsed = updateOrderStatusSchema.safeParse(req.body);

    if (!parsed.success) {
      const error = new Error("Invalid status");
      error.statusCode = 400;
      error.code = "VALIDATION_ERROR";
      error.details = parsed.error.flatten();
      throw error;
    }

    if (parsed.data.status === "CANCELLED" && !["ADMIN", "SUPER_ADMIN"].includes(req.user?.role)) {
      const error = new Error("Only administrators can cancel orders");
      error.statusCode = 403;
      error.code = "FORBIDDEN_ORDER_CANCELLATION";
      throw error;
    }

    const order = await updateOrderStatus(
  req.params.id,
  parsed.data.status,
  req.user?.id
);
    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
}
