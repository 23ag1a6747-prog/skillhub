const slugify = require('slugify');
const Category = require('../models/Category');

async function listCategories(req, res, next) {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    res.json({ categories });
  } catch (err) {
    next(err);
  }
}

async function createCategory(req, res, next) {
  try {
    const { name, description = '', icon = '' } = req.body;
    const category = await Category.create({ name, slug: slugify(name, { lower: true }), description, icon });
    res.status(201).json({ category });
  } catch (err) {
    next(err);
  }
}

async function updateCategory(req, res, next) {
  try {
    const updates = { ...req.body };
    if (updates.name) updates.slug = slugify(updates.name, { lower: true });
    const category = await Category.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!category) return res.status(404).json({ message: 'Category not found.' });
    res.json({ category });
  } catch (err) {
    next(err);
  }
}

async function deleteCategory(req, res, next) {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!category) return res.status(404).json({ message: 'Category not found.' });
    res.json({ message: 'Category deactivated.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { listCategories, createCategory, updateCategory, deleteCategory };
