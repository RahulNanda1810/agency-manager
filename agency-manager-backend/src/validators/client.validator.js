const { body } = require("express-validator");

exports.createClientValidator = [
  body("name").notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email required"),
  body("phone").notEmpty().withMessage("Phone is required")
];

exports.updateClientValidator = [
  body("email").optional().isEmail(),
  body("phone").optional().isLength({ min: 10 })
];
