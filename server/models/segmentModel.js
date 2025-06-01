const { default: mongoose } = require("mongoose");
const segmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    rules: {
      conditions: [
        {
          field: { type: String, required: true },
          operator: {
            type: String,
            enum: [">", "<", ">=", "<=", "==", "!=", "contains"],
            required: true,
          },
          value: mongoose.Schema.Types.Mixed,
          logicalOperator: { type: String, enum: ["AND", "OR"] },
        },
      ],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    audienceSize: { type: Number, default: 0 },
  },
  { timestamps: true }
);

segmentSchema.index({ createdBy: 1 });
const Segment = mongoose.model("Segment", segmentSchema);
module.exports = Segment;
