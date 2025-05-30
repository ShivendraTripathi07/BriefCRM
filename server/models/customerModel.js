const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, match: /^[0-9]{10}$/ },
    totalSpent: { type: Number, default: 0, min: 0 },
    visitCount: { type: Number, default: 0, min: 0 },
    lastVisit: { type: Date },
    isActive: { type: Boolean, default: true },
    segment: {
      type: String,
      enum: ["high-value", "regular", "inactive"],
      default: "regular",
    },
    preferences: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

customerSchema.index({ email: 1 });
customerSchema.index({ segment: 1 });
export default mongoose.model("Customer", customerSchema);
