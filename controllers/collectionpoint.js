const Collectionpoint = require('../models/collectionpoint');
const { errorHandler } = require('../helpers/dbErrorHandler');
const { parseForm } = require('../helpers/utility');


/*
exports.create = async (req, res) => {
  try {
    const { fields } = await parseForm(req);
    const { name, location, region } = fields;
    const collectionpoint = new Collectionpoint(
        { 
            name: Array.isArray(name) ? name[0] : name,
            location: Array.isArray(location) ? location[0] : location,
            region: Array.isArray(region) ? region[0] : region 
        }
    );
    await collectionpoint.save();
    return res.status(201).json({ success: true, message: "collectionpoint added successfully." });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ error: err || 'Error creating collectionpoint' });
  }
};

*/

exports.create = async (req, res) => {
    try {
        const roles = new Collectionpoint(req.body);
        const data = await roles.save();
        res.json({ data });
    } catch (err) {
        res.status(400).json({
            error: errorHandler(err)
        });
    }
};


exports.list = async (req, res) => {
    try {
        const data = await Collectionpoint.find();
        return res.status(200).json({ success: true, collectionpoint: data });
    } catch (err) {
        console.error(err.message);
        return res.status(400).json({ success: false, error: err.message });
    }
};


exports.update = async (req, res) => {
  try {
    const { fields } = await parseForm(req);
    const { _id, name, location, region } = fields;
    
    // Validate that required fields are present
    if (!_id) {
      return res.status(400).json({ error: 'collectionpoint ID is required for update' });
    }

    // Prepare the update data
    const updateData = {
      name: Array.isArray(name) ? name[0] : name,
      location: Array.isArray(location) ? location[0] : location,
      region: Array.isArray(region) ? region[0] : region
    };

    // Find the collectionpoint by ID and update all fields
    const updatedCollectionpoint = await Collectionpoint.findByIdAndUpdate(
      _id,
      updateData,
      { new: true, runValidators: true } // Options: return updated doc, run validators, overwrite all fields
    );

    if (!updatedCollectionpoint) {
      return res.status(404).json({ error: 'collectionpoint not found' });
    }

    return res.status(200).json({ 
      success: true, 
      message: "collectionpoint updated successfully."
    });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ error: err.message || 'Error updating collectionpoint' });
  }
};