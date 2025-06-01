const Customer = require("../models/customerModel");
const Order = require("../models/orderModel");
const CommunicationLog = require("../models/communicationModel");
const { validationResult, body } = require("express-validator");
const axios = require("axios");

// Validation rules for campaign creation
const campaignValidationRules = () => {
  return [
    body("name")
      .notEmpty()
      .withMessage("Campaign name is required")
      .isLength({ min: 3, max: 100 })
      .withMessage("Campaign name must be between 3-100 characters"),
    body("message")
      .notEmpty()
      .withMessage("Message template is required")
      .isLength({ min: 10, max: 500 })
      .withMessage("Message must be between 10-500 characters"),
    body("audienceRules")
      .isArray({ min: 1 })
      .withMessage("At least one audience rule is required"),
    body("audienceRules.*.field")
      .notEmpty()
      .withMessage("Rule field is required"),
    body("audienceRules.*.operator")
      .isIn(["gt", "lt", "gte", "lte", "eq", "ne", "in", "nin", "exists"])
      .withMessage("Invalid operator"),
    body("audienceRules.*.value")
      .notEmpty()
      .withMessage("Rule value is required"),
    body("audienceRules.*.logicalOperator")
      .optional()
      .isIn(["AND", "OR"])
      .withMessage("Logical operator must be AND or OR"),
  ];
};

// Helper function to build MongoDB query from audience rules
const buildAudienceQuery = (rules) => {
  const query = {};
  const conditions = [];

  for (let i = 0; i < rules.length; i++) {
    const rule = rules[i];
    let condition = {};

    // Handle different field types
    switch (rule.field) {
      case "totalSpent":
        // Aggregate customers with their total spending
        condition = { totalSpent: {} };
        break;
      case "orderCount":
        condition = { orderCount: {} };
        break;
      case "lastOrderDate":
        condition = { lastOrderDate: {} };
        break;
      case "avgOrderValue":
        condition = { avgOrderValue: {} };
        break;
      default:
        condition[rule.field] = {};
    }

    // Apply operators
    switch (rule.operator) {
      case "gt":
        condition[rule.field].$gt = parseFloat(rule.value);
        break;
      case "lt":
        condition[rule.field].$lt = parseFloat(rule.value);
        break;
      case "gte":
        condition[rule.field].$gte = parseFloat(rule.value);
        break;
      case "lte":
        condition[rule.field].$lte = parseFloat(rule.value);
        break;
      case "eq":
        condition[rule.field] = rule.value;
        break;
      case "ne":
        condition[rule.field].$ne = rule.value;
        break;
      case "in":
        condition[rule.field].$in = Array.isArray(rule.value)
          ? rule.value
          : rule.value.split(",");
        break;
      case "nin":
        condition[rule.field].$nin = Array.isArray(rule.value)
          ? rule.value
          : rule.value.split(",");
        break;
      case "exists":
        condition[rule.field].$exists = rule.value === "true";
        break;
    }

    conditions.push(condition);

    // Handle logical operators for next iteration
    if (i < rules.length - 1) {
      const nextRule = rules[i + 1];
      if (nextRule.logicalOperator === "OR") {
        // Group conditions with OR
        if (!query.$or) query.$or = [];
        query.$or.push(...conditions);
        conditions.length = 0;
      }
    }
  }

  // Add remaining conditions with AND
  if (conditions.length > 0) {
    if (query.$or) {
      query.$and = conditions;
    } else {
      Object.assign(query, ...conditions);
    }
  }

  return query;
};

// Get audience preview (count of customers matching rules)
const getAudiencePreview = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { audienceRules } = req.body;

    // Build aggregation pipeline for customer segmentation
    const pipeline = [
      // Join with orders to calculate customer metrics
      {
        $lookup: {
          from: "orders",
          localField: "_id",
          foreignField: "customerId",
          as: "orders",
        },
      },
      // Calculate customer metrics
      {
        $addFields: {
          totalSpent: { $sum: "$orders.orderValue" },
          orderCount: { $size: "$orders" },
          lastOrderDate: { $max: "$orders.orderDate" },
          avgOrderValue: { $avg: "$orders.orderValue" },
          daysSinceLastOrder: {
            $divide: [
              { $subtract: [new Date(), { $max: "$orders.orderDate" }] },
              1000 * 60 * 60 * 24,
            ],
          },
        },
      },
    ];

    // Apply audience rules as match conditions
    const matchConditions = [];

    for (const rule of audienceRules) {
      let condition = {};

      switch (rule.operator) {
        case "gt":
          condition[rule.field] = { $gt: parseFloat(rule.value) };
          break;
        case "lt":
          condition[rule.field] = { $lt: parseFloat(rule.value) };
          break;
        case "gte":
          condition[rule.field] = { $gte: parseFloat(rule.value) };
          break;
        case "lte":
          condition[rule.field] = { $lte: parseFloat(rule.value) };
          break;
        case "eq":
          condition[rule.field] = rule.value;
          break;
        case "ne":
          condition[rule.field] = { $ne: rule.value };
          break;
      }

      matchConditions.push(condition);
    }

    // Add match stage if we have conditions
    if (matchConditions.length > 0) {
      pipeline.push({ $match: { $and: matchConditions } });
    }

    // Count matching customers
    pipeline.push({ $count: "audienceSize" });

    const result = await Customer.aggregate(pipeline);
    const audienceSize = result.length > 0 ? result[0].audienceSize : 0;

    res.status(200).json({
      success: true,
      data: {
        audienceSize,
        rules: audienceRules,
      },
    });
  } catch (error) {
    console.error("Error getting audience preview:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Create and execute campaign
const createCampaign = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { name, message, audienceRules } = req.body;
    const userId = req.user.id; // From auth middleware

    // Get target audience using the same logic as preview
    const pipeline = [
      {
        $lookup: {
          from: "orders",
          localField: "_id",
          foreignField: "customerId",
          as: "orders",
        },
      },
      {
        $addFields: {
          totalSpent: { $sum: "$orders.orderValue" },
          orderCount: { $size: "$orders" },
          lastOrderDate: { $max: "$orders.orderDate" },
          avgOrderValue: { $avg: "$orders.orderValue" },
          daysSinceLastOrder: {
            $divide: [
              { $subtract: [new Date(), { $max: "$orders.orderDate" }] },
              1000 * 60 * 60 * 24,
            ],
          },
        },
      },
    ];

    // Apply audience rules
    const matchConditions = [];
    for (const rule of audienceRules) {
      let condition = {};

      switch (rule.operator) {
        case "gt":
          condition[rule.field] = { $gt: parseFloat(rule.value) };
          break;
        case "lt":
          condition[rule.field] = { $lt: parseFloat(rule.value) };
          break;
        case "gte":
          condition[rule.field] = { $gte: parseFloat(rule.value) };
          break;
        case "lte":
          condition[rule.field] = { $lte: parseFloat(rule.value) };
          break;
        case "eq":
          condition[rule.field] = rule.value;
          break;
        case "ne":
          condition[rule.field] = { $ne: rule.value };
          break;
      }

      matchConditions.push(condition);
    }

    if (matchConditions.length > 0) {
      pipeline.push({ $match: { $and: matchConditions } });
    }

    // Get the actual customers
    pipeline.push({
      $project: {
        name: 1,
        email: 1,
        phone: 1,
        totalSpent: 1,
        orderCount: 1,
      },
    });

    const targetCustomers = await Customer.aggregate(pipeline);

    if (targetCustomers.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No customers match the specified criteria",
      });
    }

    // Create campaign log entries for each customer
    const campaignLogs = targetCustomers.map((customer) => ({
      customerId: customer._id,
      campaignName: name,
      message: message.replace("{name}", customer.name), // Personalize message
      status: "PENDING",
      sentAt: new Date(),
      audienceRules,
      createdBy: userId,
    }));

    // Bulk insert communication logs
    const savedLogs = await CommunicationLog.insertMany(campaignLogs);

    // Start delivery process asynchronously
    setImmediate(() => {
      deliverCampaignMessages(savedLogs);
    });

    res.status(201).json({
      success: true,
      message: "Campaign created and delivery initiated",
      data: {
        campaignName: name,
        audienceSize: targetCustomers.length,
        message,
        logsCreated: savedLogs.length,
      },
    });
  } catch (error) {
    console.error("Error creating campaign:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Helper function to deliver campaign messages
const deliverCampaignMessages = async (campaignLogs) => {
  const VENDOR_API_URL =
    process.env.VENDOR_API_URL || "http://localhost:3000/api/vendor/send";
  const DELIVERY_RECEIPT_URL =
    process.env.DELIVERY_RECEIPT_URL ||
    "http://localhost:3000/api/delivery-receipt";

  for (const log of campaignLogs) {
    try {
      // Simulate vendor API call
      const vendorResponse = await axios.post(
        VENDOR_API_URL,
        {
          customerId: log.customerId,
          message: log.message,
          logId: log._id,
          callbackUrl: DELIVERY_RECEIPT_URL,
        },
        {
          timeout: 5000,
        }
      );

      console.log(`Message sent for log ${log._id}:`, vendorResponse.status);
    } catch (error) {
      console.error(
        `Failed to send message for log ${log._id}:`,
        error.message
      );

      // Update log with failure status
      await CommunicationLog.findByIdAndUpdate(log._id, {
        status: "FAILED",
        deliveredAt: new Date(),
        failureReason: error.message,
      });
    }
  }
};

// Get campaign history
const getCampaignHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const userId = req.user.id;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Aggregate campaign statistics
    const campaigns = await CommunicationLog.aggregate([
      { $match: { createdBy: userId } },
      {
        $group: {
          _id: {
            campaignName: "$campaignName",
            createdAt: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
          },
          totalSent: { $sum: 1 },
          delivered: { $sum: { $cond: [{ $eq: ["$status", "SENT"] }, 1, 0] } },
          failed: { $sum: { $cond: [{ $eq: ["$status", "FAILED"] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ["$status", "PENDING"] }, 1, 0] } },
          lastSentAt: { $max: "$sentAt" },
          sampleMessage: { $first: "$message" },
        },
      },
      { $sort: { lastSentAt: -1 } },
      { $skip: skip },
      { $limit: parseInt(limit) },
    ]);

    const totalCampaigns = await CommunicationLog.aggregate([
      { $match: { createdBy: userId } },
      { $group: { _id: "$campaignName" } },
      { $count: "total" },
    ]);

    const total = totalCampaigns.length > 0 ? totalCampaigns[0].total : 0;

    res.status(200).json({
      success: true,
      data: campaigns.map((campaign) => ({
        campaignName: campaign._id.campaignName,
        date: campaign._id.createdAt,
        audienceSize: campaign.totalSent,
        delivered: campaign.delivered,
        failed: campaign.failed,
        pending: campaign.pending,
        deliveryRate: ((campaign.delivered / campaign.totalSent) * 100).toFixed(
          2
        ),
        lastSentAt: campaign.lastSentAt,
        sampleMessage: campaign.sampleMessage.substring(0, 100) + "...",
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalCampaigns: total,
      },
    });
  } catch (error) {
    console.error("Error fetching campaign history:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Delivery receipt webhook (Step 7)
const handleDeliveryReceipt = async (req, res) => {
  try {
    const { logId, status, deliveredAt, failureReason } = req.body;

    if (!logId || !status) {
      return res.status(400).json({
        success: false,
        message: "logId and status are required",
      });
    }

    // Simulate 90% success rate, 10% failure
    const finalStatus = Math.random() < 0.9 ? "SENT" : "FAILED";

    const updateData = {
      status: finalStatus,
      deliveredAt: new Date(),
    };

    if (finalStatus === "FAILED") {
      updateData.failureReason = failureReason || "Delivery failed";
    }

    const updatedLog = await CommunicationLog.findByIdAndUpdate(
      logId,
      updateData,
      { new: true }
    );

    if (!updatedLog) {
      return res.status(404).json({
        success: false,
        message: "Communication log not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Delivery receipt processed",
      data: {
        logId,
        status: finalStatus,
        deliveredAt: updateData.deliveredAt,
      },
    });
  } catch (error) {
    console.error("Error processing delivery receipt:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Dummy vendor API endpoint (for testing)
const vendorSendMessage = async (req, res) => {
  try {
    const { customerId, message, logId, callbackUrl } = req.body;

    // Simulate processing delay
    setTimeout(async () => {
      try {
        // Call back to delivery receipt API
        await axios.post(callbackUrl, {
          logId,
          status: Math.random() < 0.9 ? "SENT" : "FAILED",
          deliveredAt: new Date().toISOString(),
          failureReason: Math.random() < 0.1 ? "Network timeout" : null,
        });
      } catch (error) {
        console.error("Error calling delivery receipt:", error);
      }
    }, Math.random() * 2000 + 500); // Random delay 500-2500ms

    res.status(200).json({
      success: true,
      message: "Message queued for delivery",
      data: { logId, customerId },
    });
  } catch (error) {
    console.error("Error in vendor API:", error);
    res.status(500).json({
      success: false,
      message: "Vendor API error",
      error: error.message,
    });
  }
};

module.exports = {
  getAudiencePreview,
  createCampaign,
  getCampaignHistory,
  handleDeliveryReceipt,
  vendorSendMessage,
  campaignValidationRules,
};
