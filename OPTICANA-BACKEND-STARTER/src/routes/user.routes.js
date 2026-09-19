import {Router} from "express"; import {requireAuth,requireRole} from "../middleware/auth.middleware.js"; import * as c from "../controllers/user.controller.js";
const r=Router(); r.use(requireAuth,requireRole("ADMIN","SUPER_ADMIN")); r.get("/",c.list); r.post("/",c.create); r.patch("/:id",c.update); export default r;
