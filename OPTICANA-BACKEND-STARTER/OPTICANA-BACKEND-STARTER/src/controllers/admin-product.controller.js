import {
  listAdminProducts,
  getAdminProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../services/product.service.js";

import {
  createProductSchema,
  updateProductSchema,
} from "../validators/product.validator.js";


export async function adminListProducts(req, res, next) {
  try {
    const products = await listAdminProducts();
    res.json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
}


export async function adminGetProduct(req, res, next) {
  try {
    const product = await getAdminProductById(req.params.id);

    if (!product) {
      const error = new Error("Product not found");
      error.statusCode = 404;
      error.code = "NOT_FOUND";
      throw error;
    }

    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
}


export async function adminCreateProduct(req, res, next) {
  try {
    const parsed = createProductSchema.safeParse(req.body);

    if (!parsed.success) {
      const error = new Error("Invalid product data");
      error.statusCode = 400;
      error.code = "VALIDATION_ERROR";
      error.details = parsed.error.flatten();
      throw error;
    }

    const product = await createProduct(
  parsed.data,
  req.user?.id
);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
}


export async function adminUpdateProduct(req, res, next) {
  try {
    const parsed = updateProductSchema.safeParse(req.body);

    if (!parsed.success) {
      const error = new Error("Invalid product data");
      error.statusCode = 400;
      error.code = "VALIDATION_ERROR";
      error.details = parsed.error.flatten();
      throw error;
    }

    const product = await updateProduct(req.params.id, parsed.data);
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
}


export async function adminDeleteProduct(req, res, next) {
  try {
    const result = await deleteProduct(req.params.id);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}
