const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const stopSchema = new mongoose.Schema({
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  description: { type: String, required: true },
  time: { type: Date, required: true },
  stopId: { type: String, required: true },
  place_id: { type: String, required: true },
  name: { type: String, required: true },
  status: { type: String, required: true },
  collectionpoint: {  type: ObjectId, ref: "Collectionpoint", required: true },
  driver: {  type: ObjectId, ref: "User", default: null }, 
  });

  const metricsSchema = new mongoose.Schema({
    distanceKm: { type: String, default: null },
    durationHours: { type: String, default: null },
    finishTime: { type: String, default: null } 
  });

  const GeolocationSchema = new mongoose.Schema({
  coords: {
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
    altitude: {
      type: Number,
      default: null,
    },
    accuracy: {
      type: Number,
      required: true,
    },
    altitudeAccuracy: {
      type: Number,
      default: null,
    },
    heading: {
      type: Number,
      default: null,
    },
    speed: {
      type: Number,
      default: null,
    },
  },
  timestamp: {
    type: Number, // Unix timestamp in milliseconds (Date.now() format)
    required: true,
  },
}, {
  timestamps: true, // adds createdAt and updatedAt fields
});

  
  //below indexing is done to support plan of search of address in search filter reports
  stopSchema.index({ description: "text" }); // optional
  
  const routeSchema = new mongoose.Schema(
    {
      start: { type: [stopSchema], default: []},
      end: { type: [stopSchema], default: []},
      stops: { type: [stopSchema], required: true },
      metrics: { type: [metricsSchema], default: [] },
      location: {
        type: GeolocationSchema,
        default: null
      },
      user: {
            type: ObjectId,
            ref: "User",
            required: true
        },
    },
    { timestamps: true }
  );
  
  routeSchema.index({ createdAt: 1 });
  
  module.exports = mongoose.model("Route", routeSchema);
  
