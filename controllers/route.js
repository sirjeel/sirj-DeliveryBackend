const Route = require('../models/route');
const { errorHandler } = require('../helpers/dbErrorHandler');
const mongoose = require("mongoose");



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
   let update;

    if (Array.isArray(stop)) {
      // Handle array of stop objects
      update = { $push: { stops: { $each: stop } } };
    } else if (typeof stop === 'object') {
      // Handle single stop object
      update = { $push: { stops: stop } };
    } else {
      return res.status(400).json({ error: "Invalid stop data format." });
    }

   const result = await Route.findByIdAndUpdate(
      routeId,
      update,
      { new: false } // no need to return updated document
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
    const { routeId, status, stopId, time, driverId } = req.body;

    if (!routeId || !stopId) {
      return res.status(400).json({ error: "routeId and stopId are required." });
    }

    // Update the stop with matching stopId inside the stops array of the route
    const result = await Route.updateOne(
      { _id: routeId, "stops.stopId": stopId },
      { $set: { "stops.$.status": status, "stops.$.time": time, "stops.$.driver": driverId } }
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

exports.updateGeolocation = async (req, res) => {
  try {
    const { routeId, geolocation } = req.body;

    if (!routeId || !geolocation) {
      return res.status(400).json({ error: "routeId and geolocation are required." });
    }

    // Update the stop with matching stopId inside the stops array of the route
    const result = await Route.updateOne(
      { _id: routeId },
      { $set: { "location": geolocation  } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Route not found." });
    }

    // ✅ Return only a success confirmation
    return res.status(200).json({ success: true, message: "Geolocation updated successfully." });

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

exports.fetchAllRoutesByDateRange = async (req, res) => {
  try {
    const { startDate, endDate, collectionpoints } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: "startDate and endDate are required." });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({ message: "Invalid date format. Expected 'YYYY-MM-DD'." });
    }

    end.setHours(23, 59, 59, 999);
    
    const collectionpointIds = collectionpoints.map(cp => new mongoose.Types.ObjectId(cp._id));

    // Find routes with matching collection points using MongoDB query
    const routes = await Route.find({
      createdAt: { $gte: start, $lte: end },
      'stops.collectionpoint': { $in: collectionpointIds }
    })
    .populate('stops.driver')
    .populate('stops.collectionpoint')
    .exec();

    // Filter the specific stops in JavaScript (now with populated data)
    const filteredStops = routes.flatMap(route => 
      route.stops.filter(stop => 
        stop.collectionpoint?._id && 
        collectionpointIds.some(id => id.equals(stop.collectionpoint._id))
      )
    );

    console.log('Filtered stops with populated data:', filteredStops.length);
    return res.status(200).json({ filteredData: filteredStops });

  } catch (error) {
    console.error("Error fetching routes by date range:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};





exports.fetchRouteById = async (req, res) => {
  try {
    const { routeId } = req.params; // Better than req.body for read ops

    if (!routeId) {
      return res.status(400).json({ message: "routeId is required." });
    }

    const route = await Route.findById( routeId );

    if (!route) {
      return res.status(404).json({ message: "Route not found." });
    }

    return res.status(200).json({ route });
  } catch (error) {
    console.error("Error fetching route by ID:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

 // below bulk data migration to include collectionpoint field
exports.updateStopsWithCollectionpoint = async (req, res) => {
  const defaultCollectionPointId = new mongoose.Types.ObjectId("685ec8fdcc558f99d54f458c");

  try {
    const { startDate, endDate } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: "startDate and endDate are required." });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Include entire end day

    // Query routes in the given date range
    const routes = await Route.find({
      createdAt: { $gte: start, $lte: end }
    });

    if (routes.length === 0) {
      return res.status(200).json({ message: "No routes found in the given range." });
    }

    let updatedCount = 0;

    for (const route of routes) {
      let isModified = false;

      route.stops.forEach((stop) => {
        if (!stop.collectionpoint) {
          stop.collectionpoint = defaultCollectionPointId;
          isModified = true;
        }
      });

      if (isModified) {
        await route.save();
        updatedCount++;
      }
    }

    return res.status(200).json({
      message: `Updated ${updatedCount} route(s) with collectionpoint in stops.`,
    });
  } catch (err) {
    console.error("Error updating stops:", err);
    return res.status(500).json({ error: "Failed to update stops" });
  }
};

exports.bulkupdateEta = async (req, res) => {
  try {
    const { routeId, stops } = req.body;

    if (!routeId || !Array.isArray(stops)) {
      return res.status(400).json({ error: "routeId and a valid stops array are required." });
    }

    const result = await Route.updateOne(
      { _id: routeId },
      { $set: { stops } }
    );

    if (!result.modifiedCount) {
      return res.status(404).json({ error: "Route not found or stops not updated." });
    }

    return res.status(200).json({ success: true, message: "Stops ETA updated successfully." });

  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ error: err.message || "Internal Server Error" });
  }
};


exports.driverLocationLiveTracking = async (req, res) => {
  try {
    const { startDate, endDate, collectionpoints } = req.body;

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
    
    const collectionpointFilter = collectionpoints.map(cp => new mongoose.Types.ObjectId(cp._id));


    const routes = await Route.find({
      createdAt: {
        $gte: start,
        $lte: end
      }
    })
    .populate('stops.driver')
    .populate('stops.collectionpoint') 
    .exec(); // use exec on the query chain directly  

    // Post-filter: retain routes that include **some** collectionpointFilter IDs in their stops
   const filteredRoutes = routes.filter(route => {
   const routeCollectionpointIds = route.stops.map(stop =>
    stop.collectionpoint?._id?.toString()
    );

     return collectionpointFilter.some(id =>
      routeCollectionpointIds.includes(id.toString())
      );
    });


    return res.status(200).json({ filteredRoutes });
  } catch (error) {
    console.error("Error fetching routes by date range:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};


/* below is fetchAllRoutesByDateRange version in ES6 without using mongo queries directly (less efficient)

exports.fetchAllRoutesByDateRange = async (req, res) => {
  try {
    const { startDate, endDate, collectionpoints } = req.body;

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
    
    const collectionpointFilter = collectionpoints.map(cp => new mongoose.Types.ObjectId(cp._id));


    const routes = await Route.find({
      createdAt: {
        $gte: start,
        $lte: end
      }
    })
    .populate('stops.driver')
    .populate('stops.collectionpoint') 
    .exec(); // use exec on the query chain directly



  const filterStops = (routeArray, idsToFindArray) => {
  // Convert ObjectIds to strings for comparison
  const idsToFindSet = new Set(idsToFindArray.map(id => id.toString()));
  
  return routeArray.flatMap(route => 
    [route.stops]
      .flatMap(stopArray => stopArray)
      .filter(stop => {
        const collectionPointId = stop.collectionpoint?._id?.toString();
        return collectionPointId && idsToFindSet.has(collectionPointId);
      })
  );
};


    const filteredData = filterStops(routes, collectionpointFilter);
    console.log(filteredData)

    return res.status(200).json({ filteredData });
  } catch (error) {
    console.error("Error fetching routes by date range:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

*/