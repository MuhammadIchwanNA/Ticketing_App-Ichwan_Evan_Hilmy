import { body } from "express-validator";

export const registerValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("name")
    .trim()
    .isLength({ min: 2 })
    .withMessage("Name must be at least 2 characters long"),
  body("role")
    .optional()
    .isIn(["CUSTOMER", "ORGANIZER"])
    .withMessage("Role must be either CUSTOMER or ORGANIZER"),
  body("referredBy")
    .optional()
    .isLength({ min: 6, max: 10 })
    .withMessage("Invalid referral code format"),
];

export const loginValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
];
