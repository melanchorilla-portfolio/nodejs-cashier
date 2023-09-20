import express from 'express';
import { index, store, update, show, destroy } from "../controllers/UserController.js";
import jwtAuth from '../middlewares/jwtAuth.js';
import role from '../middlewares/role.js';

var router = express.Router();

router.get("/", [jwtAuth(), role('admin', 'cashier')], index);
router.post("/", [jwtAuth(), role('admin', 'cashier')], store);
router.put("/:id", [jwtAuth(), role('admin', 'cashier')], update);
router.get("/:id", [jwtAuth(), role('admin', 'cashier')], show);
router.delete("/:id", [jwtAuth(), role('admin', 'cashier')], destroy);

export default router;