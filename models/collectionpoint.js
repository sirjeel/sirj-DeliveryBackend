

const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const placeSchema = new mongoose.Schema({
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  description: { type: String, required: true },
  place_id: { type: String, required: true },
  name: { type: String, required: true }
  });


const collectionpointSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            required: true           
        },
        location: { type: [placeSchema], required: true },        
        active: {
            type: Boolean,
            default: true
        },
        region: {
            type: [
          {
            type: ObjectId,
            ref: "Region",
          }
        ],
            default: []
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Collectionpoint", collectionpointSchema);


/*
autocomplete addstop structure

{
name: "Medina Chemist 87 Radford",
location: {
    "place_id": "ChIJjxnH9Y3BeUgRx8eTHz8z96E",
    "name": "85-87 Radford Rd",
    "lat": 52.9648597,
    "lng": -1.1702025,
    "description": "85-87 Radford Rd, Nottingham NG7 5DR, UK"
},
active: true,
region: ["68482af97259302ca4d949f1"]
}


    
*/