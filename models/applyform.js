const mongoose = require("mongoose");
const applyformSchema = new mongoose.Schema(
  {
    Name: {
      type: String,
      trim: true,
    },
    PhoneNum: {
      type: String,
      trim: true,
    },
    Email: { type: String, trim: true },
    Gender: { type: String, trim: true },
    Address: { type: String, trim: true },
    Qualification: { type: String, trim: true },
    Institution: { type: String, trim: true },
    PassingYear: { type: String, trim: true },
    CountryInterestedIn: { type: String, trim: true },
    ApplyingForVisaType: { type: String, trim: true },
    EnglishLanguageTest: { type: String, trim: true },
    TestName: { type: String, trim: true },
    TestMarks: { type: String, trim: true },
    EstimatedBudget: { type: String, trim: true },
    AnyQuery: { type: String, trim: true },
    isReplied: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ApplyForm", applyformSchema);
