const mongoose = require("mongoose");

const storySchema = new mongoose.Schema(
  {
    image: {
      url: {
        type: String,
      },
      public_id: {
        type: String,
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Story", storySchema);
