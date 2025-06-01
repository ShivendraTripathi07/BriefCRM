const { default: mongoose } = require("mongoose");

const campaignSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    segmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Segment",
      required: true,
    },
    message: { type: String, required: true },
    messageTemplate: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["draft", "active", "completed", "failed"],
      default: "draft",
    },
    scheduledAt: { type: Date }, // For cron job detection
    sentAt: { type: Date },
    audienceSize: Number,
    deliveryStats: {
      sent: { type: Number, default: 0 },
      failed: { type: Number, default: 0 },
      pending: { type: Number, default: 0 },
    },
    aiFeatures: {
      messageGenerated: Boolean,
      segmentFromNL: Boolean,
      schedulingSuggested: Boolean,
    },
  },
  { timestamps: true }
);

campaignSchema.index({ scheduledAt: 1 });
campaignSchema.index({ segmentId: 1 });
const Campaign = mongoose.model("Campaign", campaignSchema);
module.exports = Campaign;
