const mongoose = require("mongoose");

const quoteRequestSchema = new mongoose.Schema(
  {
    ProductType: {
      type: String,
      trim: true,
    },
    Quantity: {
      type: Number,
    },
    Units: {
      type: String,
      trim: true,
    },
    Height: {
      type: Number,
    },
    Width: {
      type: Number,
    },
    Depth: {
      type: Number,
    },
    Colors: {
      type: String,
      trim: true,
    },
    SheetType: {
      type: String,
      trim: true,
    },
    Name: {
      type: String,
      trim: true,
    },
    PhoneNum: {
      type: Number,
      trim: true,
    },
    Email: {
      type: String,
      trim: true,
    },
    Details: {
      type: String,
      trim: true,
    },
    isReplied: {
      type: Boolean,
      default: false,
    },
    submittedOn: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("QuoteRequest", quoteRequestSchema);
