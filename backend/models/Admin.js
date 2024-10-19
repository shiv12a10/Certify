const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const adminSchema = new Schema(
  {
    userName: {
      type: String,
      unique: true,
      required: true,
    },

    email: {
      type: String,
      unique: true,
      required: true,
    },

    password: {
      type: String,
      required: true,
    },

    tokens: {
      type: Array,
      items: {
        type: String,
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Admin", adminSchema);
