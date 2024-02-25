import { Router } from "express";
import {
  getUsers,
  loginUser,
  logout,
  signupController,
  updateUser,
} from "../controllers/user.controller";
import protectRoute from "../middlewares/protectRoute";

const router = Router();

router.route("/signup").post(signupController);

router.route("/login").post(loginUser);

router.route("/update").put(protectRoute, updateUser);

router.route("/logout").post(protectRoute, logout);

router.route("/bulk").get(protectRoute, getUsers);
export default router;
