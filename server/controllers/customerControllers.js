// controllers/customerController.js
const Customer = require("./../models/customerModel");
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

// Helper function to update customer segment based on spending and activity
const updateCustomerSegment = (customer) => {
  const daysSinceLastVisit = customer.lastVisit
    ? Math.floor(
        (new Date() - new Date(customer.lastVisit)) / (1000 * 60 * 60 * 24)
      )
    : 999;

  if (daysSinceLastVisit > 90) {
    customer.segment = "inactive";
  } else if (customer.totalSpent > 10000) {
    customer.segment = "high-value";
  } else {
    customer.segment = "regular";
  }

  customer.isActive = daysSinceLastVisit <= 90;
  return customer;
};

// @desc    Create a new customer
// @route   POST /api/customers
// @access  Private
const createCustomer = async (req, res) => {
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

    const { name, email, phone, totalSpent, visitCount, preferences } =
      req.body;

    // Check if customer already exists
    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer) {
      return res.status(409).json({
        success: false,
        message: "Customer with this email already exists",
      });
    }

    // Create new customer
    let customer = new Customer({
      name,
      email,
      phone,
      totalSpent: totalSpent || 0,
      visitCount: visitCount || 0,
      lastVisit: new Date(),
      preferences: preferences || {},
    });

    // Update segment based on spending and activity
    customer = updateCustomerSegment(customer);

    await customer.save();

    res.status(201).json({
      success: true,
      message: "Customer created successfully",
      data: customer,
    });
  } catch (error) {
    console.error("Create customer error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating customer",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Get all customers with filtering, sorting, and pagination
// @route   GET /api/customers
// @access  Private
const getCustomers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      segment,
      isActive,
      minSpent,
      maxSpent,
      minVisits,
      maxVisits,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build filter object
    const filter = {};

    if (segment) filter.segment = segment;
    if (isActive !== undefined) filter.isActive = isActive === "true";
    if (minSpent || maxSpent) {
      filter.totalSpent = {};
      if (minSpent) filter.totalSpent.$gte = Number(minSpent);
      if (maxSpent) filter.totalSpent.$lte = Number(maxSpent);
    }
    if (minVisits || maxVisits) {
      filter.visitCount = {};
      if (minVisits) filter.visitCount.$gte = Number(minVisits);
      if (maxVisits) filter.visitCount.$lte = Number(maxVisits);
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Calculate pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit))); // Max 100 per page
    const skip = (pageNum - 1) * limitNum;

    // Execute queries
    const [customers, totalCount] = await Promise.all([
      Customer.find(filter).sort(sort).skip(skip).limit(limitNum).lean(),
      Customer.countDocuments(filter),
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.status(200).json({
      success: true,
      data: customers,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalCount,
        hasNextPage,
        hasPrevPage,
        limit: limitNum,
      },
    });
  } catch (error) {
    console.error("Get customers error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching customers",
    });
  }
};

// @desc    Get customer by ID
// @route   GET /api/customers/:id
// @access  Private
const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID format",
      });
    }

    const customer = await Customer.findById(id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    res.status(200).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    console.error("Get customer by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching customer",
    });
  }
};

// @desc    Update customer
// @route   PUT /api/customers/:id
// @access  Private
const updateCustomer = async (req, res) => {
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
    const updates = req.body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID format",
      });
    }

    // Remove fields that shouldn't be updated directly
    delete updates._id;
    delete updates.createdAt;
    delete updates.updatedAt;

    // If email is being updated, check for duplicates
    if (updates.email) {
      const existingCustomer = await Customer.findOne({
        email: updates.email,
        _id: { $ne: id },
      });

      if (existingCustomer) {
        return res.status(409).json({
          success: false,
          message: "Email already exists for another customer",
        });
      }
    }

    let customer = await Customer.findById(id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // Apply updates
    Object.assign(customer, updates);

    // Update segment if spending or activity changed
    if (updates.totalSpent !== undefined || updates.lastVisit !== undefined) {
      customer = updateCustomerSegment(customer);
    }

    await customer.save();

    res.status(200).json({
      success: true,
      message: "Customer updated successfully",
      data: customer,
    });
  } catch (error) {
    console.error("Update customer error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating customer",
    });
  }
};

// @desc    Delete customer
// @route   DELETE /api/customers/:id
// @access  Private
const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID format",
      });
    }

    const customer = await Customer.findByIdAndDelete(id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Customer deleted successfully",
      data: customer,
    });
  } catch (error) {
    console.error("Delete customer error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting customer",
    });
  }
};

// @desc    Bulk create customers
// @route   POST /api/customers/bulk
// @access  Private
const bulkCreateCustomers = async (req, res) => {
  try {
    const { customers } = req.body;

    if (!Array.isArray(customers) || customers.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of customers",
      });
    }

    if (customers.length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Maximum 1000 customers allowed per bulk operation",
      });
    }

    // Validate and process each customer
    const processedCustomers = customers.map((customerData) => {
      let customer = new Customer({
        name: customerData.name,
        email: customerData.email,
        phone: customerData.phone,
        totalSpent: customerData.totalSpent || 0,
        visitCount: customerData.visitCount || 0,
        lastVisit: customerData.lastVisit || new Date(),
        preferences: customerData.preferences || {},
      });

      return updateCustomerSegment(customer);
    });

    // Use insertMany with ordered: false to continue on duplicate errors
    const result = await Customer.insertMany(processedCustomers, {
      ordered: false,
      rawResult: true,
    });

    res.status(201).json({
      success: true,
      message: `Successfully created ${result.insertedCount} customers`,
      data: {
        insertedCount: result.insertedCount,
        totalProvided: customers.length,
      },
    });
  } catch (error) {
    console.error("Bulk create customers error:", error);

    // Handle bulk write errors (like duplicate keys)
    if (error.code === 11000 || error.name === "BulkWriteError") {
      const insertedCount = error.result?.insertedCount || 0;
      res.status(207).json({
        success: false,
        message: `Partially successful: ${insertedCount} customers created, some failed due to duplicates`,
        data: {
          insertedCount,
          errors: error.writeErrors?.length || 0,
        },
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Server error during bulk creation",
      });
    }
  }
};

// @desc    Get customer statistics and segments
// @route   GET /api/customers/stats
// @access  Private
const getCustomerStats = async (req, res) => {
  try {
    const stats = await Customer.aggregate([
      {
        $group: {
          _id: null,
          totalCustomers: { $sum: 1 },
          activeCustomers: {
            $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] },
          },
          averageSpent: { $avg: "$totalSpent" },
          totalRevenue: { $sum: "$totalSpent" },
          averageVisits: { $avg: "$visitCount" },
        },
      },
    ]);

    const segmentStats = await Customer.aggregate([
      {
        $group: {
          _id: "$segment",
          count: { $sum: 1 },
          totalSpent: { $sum: "$totalSpent" },
          averageSpent: { $avg: "$totalSpent" },
        },
      },
    ]);

    const recentCustomers = await Customer.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name email totalSpent segment createdAt");

    res.status(200).json({
      success: true,
      data: {
        overview: stats[0] || {
          totalCustomers: 0,
          activeCustomers: 0,
          averageSpent: 0,
          totalRevenue: 0,
          averageVisits: 0,
        },
        segments: segmentStats,
        recentCustomers,
      },
    });
  } catch (error) {
    console.error("Get customer stats error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching statistics",
    });
  }
};

// @desc    Search customers for campaign targeting
// @route   POST /api/customers/search
// @access  Private
const parseValue = (val) => {
  if (!isNaN(val)) return Number(val);
  const date = new Date(val);
  return isNaN(date.getTime()) ? val : date;
};

const allowedOps = [
  "eq",
  "ne",
  "gt",
  "gte",
  "lt",
  "lte",
  "contains",
  "days_ago",
];

const searchCustomersForCampaign = async (req, res) => {
  try {
    const { rules, operator = "AND" } = req.body;

    if (!rules || !Array.isArray(rules) || rules.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide search rules",
      });
    }

    const conditions = rules.map(({ field, operator: op, value }) => {
      if (!allowedOps.includes(op)) {
        throw new Error(`Unsupported operator: ${op}`);
      }

      switch (op) {
        case "eq":
          return { [field]: value };
        case "ne":
          return { [field]: { $ne: value } };
        case "gt":
          return { [field]: { $gt: parseValue(value) } };
        case "gte":
          return { [field]: { $gte: parseValue(value) } };
        case "lt":
          return { [field]: { $lt: parseValue(value) } };
        case "lte":
          return { [field]: { $lte: parseValue(value) } };
        case "contains":
          return { [field]: { $regex: value, $options: "i" } };
        case "days_ago":
          if (isNaN(Number(value))) {
            throw new Error("days_ago requires a numeric value");
          }
          const daysAgo = new Date();
          daysAgo.setDate(daysAgo.getDate() - Number(value));
          return { [field]: { $lte: daysAgo } };
      }
    });

    const query =
      operator === "OR" ? { $or: conditions } : { $and: conditions };

    const customers = await Customer.find(query)
      .select("name email phone totalSpent visitCount segment lastVisit")
      .lean();

    const count = customers.length;

    res.status(200).json({
      success: true,
      data: {
        customers,
        count,
        preview: customers.slice(0, 10),
      },
    });
  } catch (error) {
    console.error("Search customers error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while searching customers",
      error: error.message,
    });
  }
};

module.exports = {
  updateCustomerSegment,
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  bulkCreateCustomers,
  getCustomerStats,
  searchCustomersForCampaign,
};
