import {
  getStoreCategories,
  listAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../services/category.service.js";

import {
  createCategorySchema,
  updateCategorySchema,
} from "../validators/category.validator.js";


export async function publicListCategories(req, res, next) {
  try {
    const categories = await getStoreCategories();
    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
}


export async function adminListCategories(req, res, next) {
  try {
    const categories = await listAdminCategories();
    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
}


export async function adminCreateCategory(req, res, next) {
  try {
    const parsed = createCategorySchema.safeParse(req.body);

    if (!parsed.success) {
      const error = new Error("Invalid category data");
      error.statusCode = 400;
      error.code = "VALIDATION_ERROR";
      error.details = parsed.error.flatten();
      throw error;
    }

    const category = await createCategory(parsed.data);
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
}


export async function adminUpdateCategory(req, res, next) {
  try {
    const parsed = updateCategorySchema.safeParse(req.body);

    if (!parsed.success) {
      const error = new Error("Invalid category data");
      error.statusCode = 400;
      error.code = "VALIDATION_ERROR";
      error.details = parsed.error.flatten();
      throw error;
    }

    const category = await updateCategory(req.params.id, parsed.data);
    res.json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
}


export async function adminDeleteCategory(req, res, next) {
  try {
    const result = await deleteCategory(req.params.id);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}
