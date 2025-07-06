const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const timeSchema = new mongoose.Schema(
     {
      clockIn: {type: Date, required: true},
      clockOut: {type: Date, required: true},
      breakIn: Date,
      breakOut: Date,
    },
    { timestamps: true }
);

// Indexes for efficient querying
timeSchema.index({ createdAt: 1 });

  
  const timesheetSchema = new mongoose.Schema(
    {
      user: {
            type: ObjectId,
            ref: "User",
            required: true
      },
      timeRecord: { type: [timeSchema], required: true }
    },
    { timestamps: true }
  );


  
  timesheetSchema.index({ createdAt: 1 });
  module.exports = mongoose.model("Timesheet", timesheetSchema);
  
