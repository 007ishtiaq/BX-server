const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const productSchema = new mongoose.Schema(
  {
    art: {
      type: Number,
      unique: true,
      trim: true,
      required: true,
      text: true,
    },
    title: {
      type: String,
      trim: true,
      required: true,
      text: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      text: true,
    },
    desattributes: [
      {
        type: Map, // Using Map to store dynamic key-value pairs
        of: String, // Values will be of type String
      },
    ],
    shippingcharges: {
      type: Number,
      trim: true,
      maxlength: 32,
    },
    category: {
      type: ObjectId,
      ref: "Category",
    },
    images: {
      type: Array,
    },
    brand: {
      type: String,
    },
    ratings: [
      {
        star: Number,
        comment: { type: String, trim: true },
        postedBy: { type: ObjectId, ref: "User" },
        isRead: { type: Boolean, default: false },
        postedOn: {
          type: Number,
          default: new Date(),
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
