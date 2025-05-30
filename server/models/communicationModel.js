const communicationLogSchema = new mongoose.Schema(
  {
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campaign",
      required: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    message: String,
    deliveryStatus: {
      type: String,
      enum: ["pending", "sent", "failed"],
      default: "pending",
    },
    vendorResponse: {
      vendorId: String,
      timestamp: Date,
      statusCode: Number,
      errorMessage: String,
    },
    deliveryAttempts: { type: Number, default: 0 },
    sentAt: Date,
    failedAt: Date,
  },
  { timestamps: true }
);

communicationLogSchema.index({ campaignId: 1 });
communicationLogSchema.index({ customerId: 1 });
export default mongoose.model("CommunicationLog", communicationLogSchema);
