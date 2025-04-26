const Route = require('../models/route');
const { errorHandler } = require('../helpers/dbErrorHandler');



exports.create = async (req, res) => {
  try {
    const route = new Route(req.body);
    const data = await route.save();
    
    // ✅ Return only the _id
    return res.status(201).json({ _id: data._id });
  } catch (err) {
    console.error(err.message);
    return res.status(400).json({ error: errorHandler(err) });
  }
};



exports.updateStop = async (req, res) => {
  try {
    const { routeId, stop } = req.body;

    if (!routeId || !stop) {
      return res.status(400).json({ error: "routeId and stop are required." });
    }
/*
    if (!mongoose.Types.ObjectId.isValid(routeId)) {
      return res.status(400).json({ error: "Invalid route ID." });
    }
*/
    const result = await Route.findByIdAndUpdate(
      routeId,
      { $push: { stops: stop } },
      { new: false } // no need to return the updated document
    );

    if (!result) {
      return res.status(404).json({ error: "Route not found." });
    }

    // ✅ Return only a success confirmation
    return res.status(200).json({ success: true, message: "Stop added successfully." });

  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ error: errorHandler(err) || "Internal Server Error" });
  }
};


//below is patch function instead of loading complete array it only patch the changes improving performance of API

exports.updateStatus = async (req, res) => {
  try {
    const { routeId, status, stopId, time } = req.body;

    if (!routeId || !stopId) {
      return res.status(400).json({ error: "routeId and stopId are required." });
    }

    // Update the stop with matching stopId inside the stops array of the route
    const result = await Route.updateOne(
      { _id: routeId, "stops.stopId": stopId },
      { $set: { "stops.$.status": status, "stops.$.time": time  } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Route or Stop not found." });
    }

    // ✅ Return only a success confirmation
    return res.status(200).json({ success: true, message: "Stop status updated successfully." });

  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ error: errorHandler(err) || "Internal Server Error" });
  }
};


exports.deleteStop = async (req, res) => {
  try {
    const { routeId, stopId } = req.body;

    if (!routeId || !stopId) {
      return res.status(400).json({ error: "routeId and stopId are required." });
    }

    const result = await Route.updateOne(
      { _id: routeId },
      { $pull: { stops: { stopId: stopId } } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: "Stop not found or already deleted." });
    }

    return res.status(200).json({ success: true, message: "Stop deleted successfully." });

  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ error: errorHandler(err) || "Internal Server Error" });
  }
};



exports.deleteMany = async (req, res) => {
  try {
    const result = await Route.deleteMany({});
    console.log(`${result.deletedCount} routes deleted.`);

    return res.status(200).json({
      success: true,
      message: "All records have been deleted.",
    });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      error: errorHandler(err) || "Internal Server Error",
    });
  }
};


exports.deleteOneroute = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, message: "ID is required." });
    }

    const deletedRoute = await Route.findByIdAndDelete(id);

    if (!deletedRoute) {
      return res.status(404).json({ success: false, message: "Route not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Route deleted successfully.",
    });

  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      error: errorHandler(err) || "Internal Server Error",
    });
  }
};


exports.fetchRoutesByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: "startDate and endDate are required." });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Validate dates
    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({ message: "Invalid date format. Expected 'YYYY-MM-DD'." });
    }

    // Adjust end date to include the full day
    end.setHours(23, 59, 59, 999);

    const routes = await Route.find({
      createdAt: {
        $gte: start,
        $lte: end
      }
    }).exec();

    return res.status(200).json({ routes });
  } catch (error) {
    console.error("Error fetching routes by date range:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};