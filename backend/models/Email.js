const mongoose = require("mongoose");

const emailSchema = new mongoose.Schema({
    email:{
        type: String,
        require: true,
        unique: true
    },
}, { timestamps: true });

module.exports = mongoose.model("Email", emailSchema);
