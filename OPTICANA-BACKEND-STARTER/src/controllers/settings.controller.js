import {
  getPublicSettings,
  upsertSetting,
  getPublicContent,
  upsertContent,
} from "../services/settings.service.js";


/* =====================================
   PUBLIC
===================================== */

export async function publicGetSettings(
  req,
  res,
  next
) {
  try {
    const settings =
      await getPublicSettings();

    res.json({
      success: true,
      data:
        settings,
    });
  } catch (error) {
    next(error);
  }
}


export async function publicGetContent(
  req,
  res,
  next
) {
  try {
    const content =
      await getPublicContent();

    res.json({
      success: true,
      data:
        content,
    });
  } catch (error) {
    next(error);
  }
}


/* =====================================
   ADMIN
===================================== */

export async function adminUpdateSetting(
  req,
  res,
  next
) {
  try {
    const {
      key,
    } = req.params;

    const {
      value,
    } = req.body;

    if (
      !key ||
      value ===
        undefined
    ) {
      const error =
        new Error(
          "key and value are required"
        );

      error.statusCode = 400;
      error.code =
        "VALIDATION_ERROR";

      throw error;
    }

    const result =
      await upsertSetting(
        key,
        value
      );

    res.json({
      success: true,
      data:
        result,
    });
  } catch (error) {
    next(error);
  }
}


export async function adminUpdateContent(
  req,
  res,
  next
) {
  try {
    const {
      key,
    } = req.params;

    const {
      value,
    } = req.body;

    if (
      !key ||
      value ===
        undefined
    ) {
      const error =
        new Error(
          "key and value are required"
        );

      error.statusCode = 400;
      error.code =
        "VALIDATION_ERROR";

      throw error;
    }

    const result =
      await upsertContent(
        key,
        value
      );

    res.json({
      success: true,
      data:
        result,
    });
  } catch (error) {
    next(error);
  }
}