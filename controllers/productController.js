const Product = require('../models/Product');
const Category = require('../models/Category');

// @desc    Get all products with filters and pagination
// @route   GET /api/products
exports.getProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 24;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.category) {
      const cat = await Category.findOne({ name: req.query.category });
      if (cat) query.category = cat._id;
    }
    if (req.query.categoryId) query.category = req.query.categoryId;
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    if (req.query.minPrice) query.priceMmk = { ...(query.priceMmk || {}), $gte: parseInt(req.query.minPrice) };
    if (req.query.maxPrice) query.priceMmk = { ...(query.priceMmk || {}), $lte: parseInt(req.query.maxPrice) };
    if (req.query.badge) query.badge = req.query.badge;

    if (req.query.isAdmin === 'true') {
      // Admin sees all including inactive
    } else {
      query.isActive = true;
    }

    const sortOrder = req.query.sort || '-createdAt';

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort(sortOrder)
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      count: products.length,
      total,
      totalPages: Math.ceil(total / limit),
      page,
      products
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name slug');
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    res.json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// @desc    Get product by slug
// @route   GET /api/products/slug/:slug
exports.getProductBySlug = async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, isActive: true }).populate('category', 'name slug');
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    res.json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// @desc    Create product
// @route   POST /api/products
exports.createProduct = async (req, res, next) => {
  try {
    const { name, category, priceMmk, ...rest } = req.body;

    if (!name || !category || !priceMmk) {
      return res.status(400).json({ success: false, error: 'Name, category and MMK price are required' });
    }

    const product = await Product.create({ name, category, priceMmk, ...rest });
    await updateCategoryCount(category);

    res.status(201).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('category', 'name slug');

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    await updateCategoryCount(product.category._id || product.category);
    res.json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    await product.deleteOne();
    await updateCategoryCount(product.category);

    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk delete products
// @route   POST /api/products/bulk-delete
exports.bulkDelete = async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, error: 'No product IDs provided' });
    }

    const products = await Product.find({ _id: { $in: ids } });
    const cats = new Set(products.map(p => p.category));

    await Product.deleteMany({ _id: { $in: ids } });

    for (const cat of cats) {
      await updateCategoryCount(cat);
    }

    res.json({ success: true, message: `${ids.length} products deleted` });
  } catch (error) {
    next(error);
  }
};

async function updateCategoryCount(categoryId) {
  try {
    const count = await Product.countDocuments({ category: categoryId });
    await Category.findByIdAndUpdate(categoryId, { productCount: count });
  } catch (err) {
    console.error('Error updating category count:', err.message);
  }
}
