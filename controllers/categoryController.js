const Category = require('../models/Category');
const Product = require('../models/Product');

// @desc    Get all categories
// @route   GET /api/categories
exports.getCategories = async (req, res, next) => {
  try {
    const includeInactive = req.query.includeInactive === 'true';
    const query = includeInactive ? {} : { isActive: true };

    const categories = await Category.find(query).sort({ sortOrder: 1, name: 1 });
    res.json({ success: true, count: categories.length, categories });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single category
// @route   GET /api/categories/:id
exports.getCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }
    const products = await Product.find({ category: category._id, isActive: true }).limit(20);
    res.json({ success: true, category, products });
  } catch (error) {
    next(error);
  }
};

// @desc    Create category
// @route   POST /api/categories
exports.createCategory = async (req, res, next) => {
  try {
    const { name, ...rest } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, error: 'Category name is required' });
    }
    const category = await Category.create({ name, ...rest });
    res.status(201).json({ success: true, category });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, error: 'Category already exists' });
    }
    next(error);
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
exports.updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!category) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }

    // Update product counts
    const count = await Product.countDocuments({ category: category._id });
    category.productCount = count;
    await category.save();

    res.json({ success: true, category });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }

    const products = await Product.countDocuments({ category: category._id });
    if (products > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot delete category with ${products} products. Move or delete products first.`
      });
    }

    await category.deleteOne();
    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    next(error);
  }
};
