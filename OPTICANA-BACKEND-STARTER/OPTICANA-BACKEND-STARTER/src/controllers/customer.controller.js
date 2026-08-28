import {
  listCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "../services/customer.service.js";

import {
  createCustomerSchema,
  updateCustomerSchema,
} from "../validators/customer.validator.js";


export async function adminListCustomers(req, res, next) {
  try {
    const customers = await listCustomers();
    res.json({ success: true, data: customers });
  } catch (error) {
    next(error);
  }
}


export async function adminGetCustomer(req, res, next) {
  try {
    const customer = await getCustomerById(req.params.id);

    if (!customer) {
      const error = new Error("Customer not found");
      error.statusCode = 404;
      error.code = "NOT_FOUND";
      throw error;
    }

    res.json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
}


export async function adminCreateCustomer(req, res, next) {
  try {
    const parsed = createCustomerSchema.safeParse(req.body);

    if (!parsed.success) {
      const error = new Error("Invalid customer data");
      error.statusCode = 400;
      error.code = "VALIDATION_ERROR";
      error.details = parsed.error.flatten();
      throw error;
    }

    const customer = await createCustomer(parsed.data);
    res.status(201).json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
}


export async function adminUpdateCustomer(req, res, next) {
  try {
    const parsed = updateCustomerSchema.safeParse(req.body);

    if (!parsed.success) {
      const error = new Error("Invalid customer data");
      error.statusCode = 400;
      error.code = "VALIDATION_ERROR";
      error.details = parsed.error.flatten();
      throw error;
    }

    const customer = await updateCustomer(req.params.id, parsed.data);
    res.json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
}


export async function adminDeleteCustomer(req, res, next) {
  try {
    const result = await deleteCustomer(req.params.id);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}
