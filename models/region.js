const mongoose = require("mongoose");

const regionSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            required: true,
            maxlength: 32,
            unique: true           
        },
          active: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Region", regionSchema);
