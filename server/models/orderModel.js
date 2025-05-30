const orderSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    orderValue: { type: Number, required: true, min: 0 },
    orderDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["pending", "completed", "cancelled"],
      default: "completed",
    },
    items: [
      {
        productId: String,
        productName: String,
        quantity: { type: Number, min: 1 },
        price: { type: Number, min: 0 },
      },
    ],
  },
  { timestamps: true }
);

orderSchema.index({ customerId: 1 });
orderSchema.index({ orderDate: -1 });
export default mongoose.model("Order", orderSchema);
