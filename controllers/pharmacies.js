const Pharmacies = require('../models/pharmacies');
const { errorHandler } = require('../helpers/dbErrorHandler');
const { parseForm } = require('../helpers/utility');



exports.create = async (req, res) => {
  try {
    const { fields } = await parseForm(req);
    const { name, location, region } = fields;
    const pharmacy = new Pharmacies(
        { 
            name: Array.isArray(name) ? name[0] : name,
            location: Array.isArray(location) ? location[0] : location,
            region: Array.isArray(region) ? region[0] : region 
        }
    );
    await pharmacy.save();
    return res.status(201).json({ success: true, message: "pharmacy added successfully." });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ error: err || 'Error creating pharmacy' });
  }
};




exports.list = async (req, res) => {
    try {
        const data = await Pharmacies.find();
        return res.status(200).json({ success: true, pharmacies: data });
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
      return res.status(400).json({ error: 'Pharmacy ID is required for update' });
    }

    // Prepare the update data
    const updateData = {
      name: Array.isArray(name) ? name[0] : name,
      location: Array.isArray(location) ? location[0] : location,
      region: Array.isArray(region) ? region[0] : region
    };

    // Find the pharmacy by ID and update all fields
    const updatedPharmacy = await Pharmacies.findByIdAndUpdate(
      _id,
      updateData,
      { new: true, runValidators: true } // Options: return updated doc, run validators, overwrite all fields
    );

    if (!updatedPharmacy) {
      return res.status(404).json({ error: 'Pharmacy not found' });
    }

    return res.status(200).json({ 
      success: true, 
      message: "Pharmacy updated successfully."
    });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ error: err.message || 'Error updating pharmacy' });
  }
};