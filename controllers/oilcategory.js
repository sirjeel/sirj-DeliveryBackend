const OilCategory = require('../models/oilcategory');
const { errorHandler } = require('../helpers/dbErrorHandler');
const { parseForm } = require('../helpers/utility');



exports.create = async (req, res) => {
  try {
    const { fields } = await parseForm(req);
    const { name } = fields;
    const category = new OilCategory({ name: Array.isArray(name) ? name[0] : name });
    await category.save();
    return res.status(201).json({ success: true, message: "Category added successfully." });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ error: err.message || 'Error creating category' });
  }
};





exports.remove = async (req, res) => {
    const categoryId = req.query.categoryId;
    if (!categoryId) {
         return res.status(400).json({ error: 'Category ID is required' });
        }

    let category;
  try {
    category = await OilCategory.findById(categoryId);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Error fetching category from DB' });
  }

  try {
    await category.deleteOne();
    return res.status(200).json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    console.error('delete error:', error);
    return res.status(500).json({ error: error.message || 'Error during delete category' });
  }
};

exports.list = async (req, res) => {
    try {
        const data = await OilCategory.find();
        return res.status(200).json({ success: true, categories: data });
    } catch (err) {
        console.error(err.message);
        return res.status(400).json({ success: false, error: err.message });
    }
};
