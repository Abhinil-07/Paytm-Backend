import { Router } from "express";
import protectRoute from "../middlewares/protectRoute";

import { getBalance, transferMoney } from "../controllers/account.controller";

const router = Router();

router.route("/balance").post(protectRoute, getBalance);

router.route("/transfer").post(protectRoute, transferMoney);

export default router;
