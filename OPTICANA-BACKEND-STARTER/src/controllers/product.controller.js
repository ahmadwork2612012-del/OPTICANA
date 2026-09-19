import {
  getStoreProducts,
  getStoreProductById,
} from "../services/product.service.js";


export async function listProducts(
  req,
  res,
  next
) {
  try {
    const products =
      await getStoreProducts();

    res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    next(error);
  }
}


export async function getProduct(
  req,
  res,
  next
) {
  try {
    const product =
      await getStoreProductById(
        req.params.id
      );

    if (!product) {
      const error =
        new Error(
          "Product not found"
        );

      error.statusCode = 404;
      error.code = "NOT_FOUND";

      throw error;
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
}
