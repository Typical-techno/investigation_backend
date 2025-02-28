import express from "express";
import { signup, login, checkToken } from "../controllers/authController";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/checkToken", checkToken)

export default router;
