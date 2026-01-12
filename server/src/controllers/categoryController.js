const Category = require('../models/category');
const mongoose = require('mongoose');

// Generate slug from name
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Get all categories
exports.getAllCategories = async (req, res) => {
  try {
    const { search } = req.query;
    
    const filter = {};
    
    // Search filter
    if (search && search.trim()) {
      filter.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { slug: { $regex: search.trim(), $options: 'i' } }
      ];
    }
    
    const categories = await Category.find(filter)
      .sort({ createdAt: -1 })
      .lean();
    
    res.status(200).json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get single category
exports.getCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID'
      });
    }
    
    const category = await Category.findById(id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    res.status(200).json({
      success: true,
      category
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Create category
exports.createCategory = async (req, res) => {
  try {
    const { name, description, slug } = req.body;
    
    // Validate required fields
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
    }
    
    // Generate slug if not provided
    const categorySlug = slug || generateSlug(name);
    
    // Check if category with same name or slug already exists
    const existingCategory = await Category.findOne({
      $or: [
        { name: name.trim() },
        { slug: categorySlug }
      ]
    });
    
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: existingCategory.name === name.trim() 
          ? 'Category with this name already exists'
          : 'Category with this slug already exists'
      });
    }
    
    // Create category
    const category = new Category({
      name: name.trim(),
      slug: categorySlug,
      description: description?.trim() || '',
      createdBy: req.user?._id
    });
    
    await category.save();
    
    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category
    });
  } catch (error) {
    console.error('Error creating category:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name or slug already exists'
      });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Update category
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, slug, isActive } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID'
      });
    }
    
    const category = await Category.findById(id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    // Check if name or slug conflicts with existing category
    if (name || slug) {
      const updateName = name?.trim() || category.name;
      const updateSlug = slug || generateSlug(updateName);
      
      const existingCategory = await Category.findOne({
        _id: { $ne: id },
        $or: [
          { name: updateName },
          { slug: updateSlug }
        ]
      });
      
      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: existingCategory.name === updateName
            ? 'Category with this name already exists'
            : 'Category with this slug already exists'
        });
      }
    }
    
    // Update fields
    if (name) category.name = name.trim();
    if (description !== undefined) category.description = description?.trim() || '';
    if (slug) category.slug = slug;
    else if (name) category.slug = generateSlug(name.trim());
    if (isActive !== undefined) category.isActive = isActive;
    category.updatedBy = req.user?._id;
    
    await category.save();
    
    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      category
    });
  } catch (error) {
    console.error('Error updating category:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name or slug already exists'
      });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Delete category
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID'
      });
    }
    
    const category = await Category.findById(id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    // Check if category is being used by products
    const Product = require('../models/product');
    const productsWithCategory = await Product.countDocuments({ category: category.name });
    
    if (productsWithCategory > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. It is being used by ${productsWithCategory} product(s). Please update or remove those products first.`
      });
    }
    
    await Category.findByIdAndDelete(id);
    
    res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
