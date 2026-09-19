import {
  getAllContent,
  getAllSettings,
  upsertContent,
  upsertSetting,
} from "../services/settings.service.js";
import { listManagerOrders } from "../services/order.service.js";

function ensureValue(req) {
  if (req.body?.value === undefined) {
    const error = new Error("value is required");
    error.statusCode = 400;
    error.code = "VALIDATION_ERROR";
    throw error;
  }
}

export async function getManagerStoreData(req, res, next) {
  try {
    const [settings, content] = await Promise.all([getAllSettings(), getAllContent()]);
    res.json({ success: true, data: { settings, content } });
  } catch (error) {
    next(error);
  }
}

export async function updateManagerSetting(req, res, next) {
  try {
    ensureValue(req);
    const result = await upsertSetting(req.params.key, req.body.value);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function updateManagerContent(req, res, next) {
  try {
    ensureValue(req);
    const result = await upsertContent(req.params.key, req.body.value);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function getManagerOrders(req, res, next) {
  try {
    const range = String(req.query.range || "24h").toLowerCase();
    if (!['24h', 'all'].includes(range)) {
      const error = new Error("range must be 24h or all");
      error.statusCode = 400;
      error.code = "VALIDATION_ERROR";
      throw error;
    }
    const orders = await listManagerOrders({ recentOnly: range !== "all" });
    res.json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
}
