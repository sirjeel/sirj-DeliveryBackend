const Region = require('../models/region');
const { errorHandler } = require('../helpers/dbErrorHandler');
const { parseForm } = require('../helpers/utility');



exports.create = async (req, res) => {
  try {
    const { fields } = await parseForm(req);
    const { name } = fields;
    const region = new Region({ name: Array.isArray(name) ? name[0] : name });
    await region.save();
    return res.status(201).json({ success: true, message: "Region added successfully." });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ error: err.message || 'Error creating Region' });
  }
};









exports.list = async (req, res) => {
    try {
        const data = await Region.find();
        return res.status(200).json({ success: true, region: data });
    } catch (err) {
        console.error(err.message);
        return res.status(400).json({ success: false, error: err.message });
    }
};



exports.update = async (req, res) => {
  try {
    const { fields } = await parseForm(req);
    const { _id, name } = fields;
    
    // Validate that required fields are present
    if (!_id) {
      return res.status(400).json({ error: 'Region ID is required for update' });
    }

    // Prepare the update data
    const updateData = {
      name: Array.isArray(name) ? name[0] : name
    };

    // Find the Region by ID and update all fields
    const updatedRegion = await Region.findByIdAndUpdate(
      _id,
      updateData,
      { new: true, runValidators: true } // Options: return updated doc, run validators, overwrite all fields
    );

    if (!updatedRegion) {
      return res.status(404).json({ error: 'Region not found' });
    }

    return res.status(200).json({ 
      success: true, 
      message: "Region updated successfully."
    });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ error: err.message || 'Error updating Region' });
  }
};