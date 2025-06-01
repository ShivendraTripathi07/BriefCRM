const mongoose = require("mongoose");

const communicationLogSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    campaignName: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "SENT", "FAILED"],
      default: "PENDING",
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
    deliveredAt: {
      type: Date,
    },
    failureReason: {
      type: String,
    },
    audienceRules: [
      {
        field: { type: String, required: true },
        operator: {
          type: String,
          enum: ["gt", "lt", "gte", "lte", "eq", "ne", "in", "nin", "exists"],
          required: true,
        },
        value: { type: mongoose.Schema.Types.Mixed, required: true },
        logicalOperator: {
          type: String,
          enum: ["AND", "OR"],
        },
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    metadata: {
      vendorResponse: mongoose.Schema.Types.Mixed,
      retryCount: { type: Number, default: 0 },
      lastRetryAt: Date,
    },
  },
  {
    timestamps: true,
    // Add indexes for better query performance
    indexes: [
      { customerId: 1 },
      { campaignName: 1 },
      { status: 1 },
      { sentAt: -1 },
      { createdBy: 1 },
      { campaignName: 1, sentAt: -1 }, // Compound index for campaign history
    ],
  }
);

// Indexes for better performance
communicationLogSchema.index({ customerId: 1 });
communicationLogSchema.index({ campaignName: 1 });
communicationLogSchema.index({ status: 1 });
communicationLogSchema.index({ sentAt: -1 });
communicationLogSchema.index({ createdBy: 1 });
communicationLogSchema.index({ campaignName: 1, sentAt: -1 });

// Virtual for delivery success rate
communicationLogSchema.virtual("deliveryRate").get(function () {
  return this.status === "SENT" ? 100 : 0;
});

// Static methods
communicationLogSchema.statics.getCampaignStats = function (campaignName) {
  return this.aggregate([
    { $match: { campaignName } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        sent: { $sum: { $cond: [{ $eq: ["$status", "SENT"] }, 1, 0] } },
        failed: { $sum: { $cond: [{ $eq: ["$status", "FAILED"] }, 1, 0] } },
        pending: { $sum: { $cond: [{ $eq: ["$status", "PENDING"] }, 1, 0] } },
      },
    },
  ]);
};

// Instance methods
communicationLogSchema.methods.markAsDelivered = function () {
  this.status = "SENT";
  this.deliveredAt = new Date();
  return this.save();
};

communicationLogSchema.methods.markAsFailed = function (reason) {
  this.status = "FAILED";
  this.deliveredAt = new Date();
  this.failureReason = reason;
  return this.save();
};

const CommunicationLog = mongoose.model(
  "CommunicationLog",
  communicationLogSchema
);

module.exports = CommunicationLog;
