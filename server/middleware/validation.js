const { body } = require("express-validator");

// User registration validation
const validateRegister = [
  body("username")
    .isLength({ min: 3, max: 50 })
    .withMessage("Username must be between 3 and 50 characters")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username can only contain letters, numbers, and underscores"),

  body("email")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one lowercase letter, one uppercase letter, and one number"
    ),
];

// User login validation
const validateLogin = [
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),

  body("password").notEmpty().withMessage("Password is required"),
];

// Post creation/update validation
const validatePost = [
  body("title")
    .isLength({ min: 1, max: 255 })
    .withMessage("Title is required and must be less than 255 characters")
    .trim(),

  body("content")
    .isLength({ min: 1 })
    .withMessage("Content is required")
    .trim(),

  body("tags")
    .optional()
    .isLength({ max: 255 })
    .withMessage("Tags must be less than 255 characters")
    .trim(),
];

// Comment creation/update validation
const validateComment = [
  body("content")
    .isLength({ min: 1, max: 1000 })
    .withMessage(
      "Comment content is required and must be less than 1000 characters"
    )
    .trim(),
];

module.exports = {
  validateRegister,
  validateLogin,
  validatePost,
  validateComment,
};
