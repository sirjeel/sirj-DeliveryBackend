const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const oilproductSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            required: true,
            maxlength: 32
        },
         sku: {
            type: String,
            trim: true,
            required: true,
            maxlength: 52
        },
        description: {
            type: String,
            required: true,
            maxlength: 2000
        },
        price: {
            type: Number,
            trim: true,
            required: true,
            maxlength: 32
        },
        category: {
            type: String,
            trim: true,
            required: true,
            maxlength: 32
        },
        sold: {
            type: Number,
            default: 0
        },
        active: {
            type: Boolean,
            default: true
        },
        photos: {
            type: [String], // Array of image URLs or base64 strings
            validate: {
                validator: function (arr) {
                    return arr.length <= 4;
                },
                message: props => `A maximum of 4 photos are allowed, but received ${props.value.length}`
            },
            default: [] // Allows admin to save 0–4 images
        }        
    },
    { timestamps: true }
);

module.exports = mongoose.model("Oilproduct", oilproductSchema);
