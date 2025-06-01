const Order = require("../models/orderModel");
const Customer = require("../models/customerModel");
const { validationResult, body } = require("express-validator");

// Validation rules for order creation and updates
const orderValidationRules = () => {
  return [
    body("customerId")
      .notEmpty()
      .withMessage("Customer ID is required")
      .isMongoId()
      .withMessage("Invalid customer ID format"),
    body("orderValue")
      .isFloat({ min: 0 })
      .withMessage("Order value must be a positive number"),
    body("orderDate")
      .isISO8601()
      .withMessage("Order date must be a valid date"),
    body("status")
      .optional()
      .isIn(["pending", "completed", "cancelled"])
      .withMessage("Status must be pending, completed, or cancelled"),
    body("items").optional().isArray().withMessage("Items must be an array"),
    body("items.*.productId")
      .optional()
      .notEmpty()
      .withMessage("Product ID is required for each item"),
    body("items.*.productName")
      .optional()
      .notEmpty()
      .withMessage("Product name is required for each item"),
    body("items.*.quantity")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Quantity must be at least 1"),
    body("items.*.price")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number"),
  ];
};

// Create a new order
const createOrder = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { customerId, orderValue, orderDate, status, items } = req.body;

    // Verify customer exists
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // Create new order
    const order = new Order({
      customerId,
      orderValue,
      orderDate: new Date(orderDate),
      status: status || "completed",
      items: items || [],
    });

    const savedOrder = await order.save();

    // Populate customer information for response
    await savedOrder.populate("customerId", "name email");

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: savedOrder,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get all orders with pagination and filtering
const getAllOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      customerId,
      status,
      minValue,
      maxValue,
      startDate,
      endDate,
      sortBy = "orderDate",
      sortOrder = "desc",
    } = req.query;

    // Build filter object
    const filter = {};

    if (customerId) {
      filter.customerId = customerId;
    }

    if (status) {
      filter.status = status;
    }

    if (minValue || maxValue) {
      filter.orderValue = {};
      if (minValue) filter.orderValue.$gte = parseFloat(minValue);
      if (maxValue) filter.orderValue.$lte = parseFloat(maxValue);
    }

    if (startDate || endDate) {
      filter.orderDate = {};
      if (startDate) filter.orderDate.$gte = new Date(startDate);
      if (endDate) filter.orderDate.$lte = new Date(endDate);
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const orders = await Order.find(filter)
      .populate("customerId", "name email phone")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const totalOrders = await Order.countDocuments(filter);
    const totalPages = Math.ceil(totalOrders / parseInt(limit));

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalOrders,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get single order by ID
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id).populate(
      "customerId",
      "name email phone"
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Update order
const updateOrder = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { id } = req.params;
    const updateData = req.body;

    // If customerId is being updated, verify the new customer exists
    if (updateData.customerId) {
      const customer = await Customer.findById(updateData.customerId);
      if (!customer) {
        return res.status(404).json({
          success: false,
          message: "Customer not found",
        });
      }
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate("customerId", "name email phone");

    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Order updated successfully",
      data: updatedOrder,
    });
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Delete order
const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedOrder = await Order.findByIdAndDelete(id);

    if (!deletedOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Order deleted successfully",
      data: deletedOrder,
    });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get orders by customer ID
const getOrdersByCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;
    const {
      page = 1,
      limit = 10,
      status,
      sortBy = "orderDate",
      sortOrder = "desc",
    } = req.query;

    // Verify customer exists
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // Build filter
    const filter = { customerId };
    if (status) filter.status = status;

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const orders = await Order.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const totalOrders = await Order.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: orders,
      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
      },
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalOrders / parseInt(limit)),
        totalOrders,
      },
    });
  } catch (error) {
    console.error("Error fetching customer orders:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get order statistics (for CRM insights)
const getOrderStats = async (req, res) => {
  try {
    const { customerId, startDate, endDate } = req.query;

    // Build match stage for aggregation
    const matchStage = {};
    if (customerId) matchStage.customerId = mongoose.Types.ObjectId(customerId);
    if (startDate || endDate) {
      matchStage.orderDate = {};
      if (startDate) matchStage.orderDate.$gte = new Date(startDate);
      if (endDate) matchStage.orderDate.$lte = new Date(endDate);
    }

    const stats = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalValue: { $sum: "$orderValue" },
          averageOrderValue: { $avg: "$orderValue" },
          maxOrderValue: { $max: "$orderValue" },
          minOrderValue: { $min: "$orderValue" },
          completedOrders: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
          pendingOrders: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
          },
          cancelledOrders: {
            $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
          },
        },
      },
    ]);

    // Get order trends by month
    const monthlyTrends = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            year: { $year: "$orderDate" },
            month: { $month: "$orderDate" },
          },
          orderCount: { $sum: 1 },
          totalValue: { $sum: "$orderValue" },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      { $limit: 12 },
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: stats[0] || {
          totalOrders: 0,
          totalValue: 0,
          averageOrderValue: 0,
          maxOrderValue: 0,
          minOrderValue: 0,
          completedOrders: 0,
          pendingOrders: 0,
          cancelledOrders: 0,
        },
        monthlyTrends,
      },
    });
  } catch (error) {
    console.error("Error fetching order stats:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Bulk create orders (useful for data ingestion)
const bulkCreateOrders = async (req, res) => {
  try {
    console.log("Received req.body:", req.body);
    const { orders } = req.body;
    console.log("Received req.body:", req.body);

    if (!Array.isArray(orders) || orders.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Orders array is required and cannot be empty",
      });
    }

    // Validate each order has required fields
    const validationErrors = [];
    for (let i = 0; i < orders.length; i++) {
      const order = orders[i];
      if (!order.customerId || !order.orderValue || !order.orderDate) {
        validationErrors.push(`Order at index ${i} is missing required fields`);
      }
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
      });
    }

    // Process orders in batches to avoid memory issues
    const batchSize = 100;
    const results = [];
    const errors = [];

    for (let i = 0; i < orders.length; i += batchSize) {
      const batch = orders.slice(i, i + batchSize);
      try {
        const insertedOrders = await Order.insertMany(batch, {
          ordered: false,
        });
        results.push(...insertedOrders);
      } catch (error) {
        errors.push({
          batchStart: i,
          error: error.message,
        });
      }
    }

    res.status(201).json({
      success: true,
      message: "Bulk order creation completed",
      data: {
        totalProcessed: orders.length,
        successful: results.length,
        failed: orders.length - results.length,
        errors: errors.length > 0 ? errors : undefined,
      },
    });
  } catch (error) {
    console.error("Error in bulk order creation:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  getOrdersByCustomer,
  getOrderStats,
  bulkCreateOrders,
  orderValidationRules,
};
