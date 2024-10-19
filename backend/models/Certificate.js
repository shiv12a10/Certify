const mongoose = require("mongoose");

const certificateSchema = new mongoose.Schema(
  {
    keyName: {
      type: String,
      require: true,
      unique: true,
    },
    email: {
      type: String,
      require: true,
      unique: true,
    },
    name: {
      type: String,
      require: true,
    },
    url: {
      type: String,
    },
    valid: {
      type: Boolean,
      default: true,
    },
    verification: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Verification",
    },
    admins: {
      type: Array,
      items: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin",
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Certificate", certificateSchema);
