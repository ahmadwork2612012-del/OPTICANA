import { globalSearch } from "../services/search.service.js";
export async function adminGlobalSearch(req, res, next) {
  try {
    res.json({ success: true, data: await globalSearch(req.query.q, req.query.limit) });
  } catch (error) {
    next(error);
  }
}
