// routes/customerRoutes.js
const express = require("express");
const {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  bulkCreateCustomers,
  getCustomerStats,
  searchCustomersForCampaign,
} = require("../controllers/customerControllers.js");
const {
  validateCreateCustomer,
  validateUpdateCustomer,
  validateBulkCreate,
  validateCustomerQuery,
  validateCampaignSearch,
} = require("../validation/customerValidation.js");
const authToken = require("./../middleware/auth"); // Your auth middleware

const router = express.Router();

// Apply authentication to all customer routes
router.use(authToken);

// Customer CRUD routes
router
  .route("/")
  .get(validateCustomerQuery, getCustomers)
  .post(validateCreateCustomer, createCustomer);

router.route("/bulk").post(validateBulkCreate, bulkCreateCustomers);

router.route("/stats").get(getCustomerStats);

router
  .route("/search")
  .post(validateCampaignSearch, searchCustomersForCampaign);

router
  .route("/:id")
  .get(getCustomerById)
  .put(validateUpdateCustomer, updateCustomer)
  .delete(deleteCustomer);

module.exports = router;
