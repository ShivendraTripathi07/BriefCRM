const express = require("express");
const router = express.Router();
const {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  getOrdersByCustomer,
  getOrderStats,
  bulkCreateOrders,
  orderValidationRules,
} = require("../controllers/orderController");

// Middleware for authentication (assuming you have auth middleware)
const authenticateUser = require("../middleware/auth");

// Apply authentication to all routes
router.use(authenticateUser);

// GET /api/orders/stats - Get order statistics (must be before /:id route)
router.get("/stats", getOrderStats);

// GET /api/orders/customer/:customerId - Get orders by customer
router.get("/customer/:customerId", getOrdersByCustomer);

// POST /api/orders/bulk - Bulk create orders
router.post("/bulk", bulkCreateOrders);

// GET /api/orders - Get all orders with filtering and pagination
router.get("/", getAllOrders);

// POST /api/orders - Create a new order
router.post("/", orderValidationRules(), createOrder);

// GET /api/orders/:id - Get order by ID
router.get("/:id", getOrderById);

// PUT /api/orders/:id - Update order
router.put("/:id", orderValidationRules(), updateOrder);

// DELETE /api/orders/:id - Delete order
router.delete("/:id", deleteOrder);

module.exports = router;
