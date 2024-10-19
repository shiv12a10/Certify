const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const verificationSchema = new Schema(
  {
    certificate: {
      type: Schema.Types.ObjectId,
      ref: "Certificate",
    },
    verificationCode: {
      type: String,
      require: true,
    },
    verificationUrl: {
      type: String,
      require: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Verification", verificationSchema);
