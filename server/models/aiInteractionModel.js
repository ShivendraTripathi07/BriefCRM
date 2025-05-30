const aiInteractionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    featureType: {
      type: String,
      enum: ["nl_to_segment", "message_generation", "performance_summary"],
      required: true,
    },
    input: String,
    output: String,
    model: String,
    tokens: Number,
    cost: Number,
  },
  { timestamps: true }
);

aiInteractionSchema.index({ userId: 1 });
export default mongoose.model("AIInteraction", aiInteractionSchema);
