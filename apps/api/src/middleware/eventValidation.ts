import { body } from "express-validator";

export const createEventValidation = [
  body("name")
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage("Event name must be between 3 and 200 characters"),
  body("description")
    .trim()
    .isLength({ min: 10 })
    .withMessage("Description must be at least 10 characters long"),
  body("price")
    .isInt({ min: 0 })
    .withMessage("Price must be a non-negative integer"),
  body("startDate")
    .isISO8601()
    .toDate()
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error("Start date must be in the future");
      }
      return true;
    }),
  body("endDate")
    .isISO8601()
    .toDate()
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startDate)) {
        throw new Error("End date must be after start date");
      }
      return true;
    }),
  body("totalSeats")
    .isInt({ min: 1 })
    .withMessage("Total seats must be at least 1"),
  body("location")
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage("Location must be between 3 and 200 characters"),
  body("category")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Category must be between 2 and 50 characters"),
  body("imageUrl")
    .optional()
    .isURL()
    .withMessage("Image URL must be a valid URL"),
];

export const updateEventValidation = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage("Event name must be between 3 and 200 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ min: 10 })
    .withMessage("Description must be at least 10 characters long"),
  body("price")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Price must be a non-negative integer"),
  body("startDate")
    .optional()
    .isISO8601()
    .toDate()
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error("Start date must be in the future");
      }
      return true;
    }),
  body("endDate").optional().isISO8601().toDate(),
  body("totalSeats")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Total seats must be at least 1"),
  body("location")
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage("Location must be between 3 and 200 characters"),
  body("category")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Category must be between 2 and 50 characters"),
  body("imageUrl")
    .optional()
    .isURL()
    .withMessage("Image URL must be a valid URL"),
];
