// src/routes/auth.routes.js
import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import { validateRequest } from "../middleware/validate.middleware.js";
import * as authSchemas from "../schemas/auth.schema.js";

const router = Router();

// Login Admin / Sekolah
router.post(
  "/login",
  validateRequest(authSchemas.loginSchema),
  authController.login
);

// Request OTP Siswa
router.post(
  "/student/request-otp",
  validateRequest(authSchemas.studentOtpRequestSchema),
  authController.requestOtp
);

// Login Siswa
router.post(
  "/student/login",
  validateRequest(authSchemas.studentLoginSchema),
  authController.loginStudent
);

// Generate SIWE Nonce
router.get("/siwe/nonce", authController.getSiweNonce);

// Refresh Token
router.post("/refresh", authController.refreshToken);

// Logout
router.post("/logout", authController.logout);

export default router;
