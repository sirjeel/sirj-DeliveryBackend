const mongoose = require("mongoose");

const stopSchema = new mongoose.Schema({
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  description: { type: String, required: true },
  time: { type: Date, required: true },
  stopId: { type: String, required: true },
  place_id: { type: String, required: true },
  name: { type: String, required: true },
  status: { type: String, required: true },
  });

  const metricsSchema = new mongoose.Schema({
    distanceKm: { type: String, required: true },
    durationHours: { type: String, required: true },
    finishTime: { type: String, required: true } 
  });

  
  //below indexing is done to support plan of search of address in search filter reports
  stopSchema.index({ description: "text" }); // optional
  
  const routeSchema = new mongoose.Schema(
    {
      start: { type: [stopSchema], default: []},
      end: { type: [stopSchema], default: []},
      stops: { type: [stopSchema], required: true },
      metrics: { type: [metricsSchema], default: [] }
    },
    { timestamps: true }
  );
  
  routeSchema.index({ createdAt: 1 });
  
  module.exports = mongoose.model("Route", routeSchema);
  
