import {
  listSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from "../services/supplier.service.js";


import {
  createSupplierSchema,
  updateSupplierSchema,
} from "../validators/supplier.validator.js";


export async function adminListSuppliers(
  req,
  res,
  next
) {
  try {
    const suppliers =
      await listSuppliers();

    res.json({
      success: true,
      data: suppliers,
    });
  } catch (error) {
    next(error);
  }
}


export async function adminGetSupplier(
  req,
  res,
  next
) {
  try {
    const supplier =
      await getSupplierById(
        req.params.id
      );

    if (!supplier) {
      const error = new Error(
        "Supplier not found"
      );

      error.statusCode = 404;
      error.code = "NOT_FOUND";

      throw error;
    }

    res.json({
      success: true,
      data: supplier,
    });
  } catch (error) {
    next(error);
  }
}


export async function adminCreateSupplier(
  req,
  res,
  next
) {
  try {
    const parsed =
      createSupplierSchema.safeParse(
        req.body
      );

    if (!parsed.success) {
      const error = new Error(
        "Invalid supplier data"
      );

      error.statusCode = 400;
      error.code =
        "VALIDATION_ERROR";
      error.details =
        parsed.error.flatten();

      throw error;
    }

    const supplier =
      await createSupplier(
        parsed.data
      );

    res.status(201).json({
      success: true,
      data: supplier,
    });
  } catch (error) {
    next(error);
  }
}


export async function adminUpdateSupplier(
  req,
  res,
  next
) {
  try {
    const parsed =
      updateSupplierSchema.safeParse(
        req.body
      );

    if (!parsed.success) {
      const error = new Error(
        "Invalid supplier data"
      );

      error.statusCode = 400;
      error.code =
        "VALIDATION_ERROR";
      error.details =
        parsed.error.flatten();

      throw error;
    }

    const supplier =
      await updateSupplier(
        req.params.id,
        parsed.data
      );

    res.json({
      success: true,
      data: supplier,
    });
  } catch (error) {
    next(error);
  }
}


export async function adminDeleteSupplier(
  req,
  res,
  next
) {
  try {
    const result =
      await deleteSupplier(
        req.params.id
      );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}