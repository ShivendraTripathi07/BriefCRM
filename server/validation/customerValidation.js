// middleware/customerValidation.js
const { body, query } = require("express-validator");

const validateCreateCustomer = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2-100 characters"),

  body("email")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),

  body("phone")
    .optional()
    .matches(/^[0-9]{10}$/)
    .withMessage("Phone must be exactly 10 digits"),

  body("totalSpent")
    .optional()
    .isNumeric()
    .withMessage("Total spent must be a number")
    .custom((value) => {
      if (value < 0) {
        throw new Error("Total spent cannot be negative");
      }
      return true;
    }),

  body("visitCount")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Visit count must be a non-negative integer"),

  body("preferences")
    .optional()
    .isObject()
    .withMessage("Preferences must be an object"),
];

const validateUpdateCustomer = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2-100 characters"),

  body("email")
    .optional()
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),

  body("phone")
    .optional()
    .matches(/^[0-9]{10}$/)
    .withMessage("Phone must be exactly 10 digits"),

  body("totalSpent")
    .optional()
    .isNumeric()
    .withMessage("Total spent must be a number")
    .custom((value) => {
      if (value < 0) {
        throw new Error("Total spent cannot be negative");
      }
      return true;
    }),

  body("visitCount")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Visit count must be a non-negative integer"),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),

  body("segment")
    .optional()
    .isIn(["high-value", "regular", "inactive"])
    .withMessage("Segment must be one of: high-value, regular, inactive"),

  body("preferences")
    .optional()
    .isObject()
    .withMessage("Preferences must be an object"),
];

const validateBulkCreate = [
  body("customers")
    .isArray({ min: 1, max: 1000 })
    .withMessage("Customers must be an array with 1-1000 items"),

  body("customers.*.name")
    .trim()
    .notEmpty()
    .withMessage("Each customer must have a name")
    .isLength({ min: 2, max: 100 })
    .withMessage("Customer names must be between 2-100 characters"),

  body("customers.*.email")
    .isEmail()
    .withMessage("Each customer must have a valid email")
    .normalizeEmail(),

  body("customers.*.phone")
    .optional()
    .matches(/^[0-9]{10}$/)
    .withMessage("Phone numbers must be exactly 10 digits"),

  body("customers.*.totalSpent")
    .optional()
    .isNumeric()
    .withMessage("Total spent must be a number")
    .custom((value) => {
      if (value < 0) {
        throw new Error("Total spent cannot be negative");
      }
      return true;
    }),

  body("customers.*.visitCount")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Visit count must be a non-negative integer"),
];

const validateCustomerQuery = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1-100"),

  query("segment")
    .optional()
    .isIn(["high-value", "regular", "inactive"])
    .withMessage("Segment must be one of: high-value, regular, inactive"),

  query("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be true or false"),

  query("minSpent")
    .optional()
    .isNumeric()
    .withMessage("minSpent must be a number"),

  query("maxSpent")
    .optional()
    .isNumeric()
    .withMessage("maxSpent must be a number"),

  query("minVisits")
    .optional()
    .isInt({ min: 0 })
    .withMessage("minVisits must be a non-negative integer"),

  query("maxVisits")
    .optional()
    .isInt({ min: 0 })
    .withMessage("maxVisits must be a non-negative integer"),

  query("sortBy")
    .optional()
    .isIn([
      "name",
      "email",
      "totalSpent",
      "visitCount",
      "lastVisit",
      "createdAt",
      "updatedAt",
    ])
    .withMessage("Invalid sortBy field"),

  query("sortOrder")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("sortOrder must be asc or desc"),
];

const validateCampaignSearch = [
  body("rules")
    .isArray({ min: 1 })
    .withMessage("Rules must be a non-empty array"),

  body("rules.*.field")
    .isIn([
      "name",
      "email",
      "totalSpent",
      "visitCount",
      "lastVisit",
      "segment",
      "isActive",
    ])
    .withMessage("Invalid field in rules"),

  body("rules.*.operator")
    .isIn(["eq", "ne", "gt", "gte", "lt", "lte", "contains", "days_ago"])
    .withMessage("Invalid operator in rules"),

  body("rules.*.value")
    .notEmpty()
    .withMessage("Value is required for each rule"),

  body("operator")
    .optional()
    .isIn(["AND", "OR"])
    .withMessage("Operator must be AND or OR"),
];

module.exports = {
  validateCreateCustomer,
  validateUpdateCustomer,
  validateBulkCreate,
  validateCustomerQuery,
  validateCampaignSearch,
};
