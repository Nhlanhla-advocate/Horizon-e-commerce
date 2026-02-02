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

// Helper function to build category tree
const buildCategoryTree = (categories, parentId = null) => {
  return categories
    .filter(cat => {
      if (parentId === null) return !cat.parent;
      return cat.parent && cat.parent.toString() === parentId.toString();
    })
    .map(cat => ({
      ...cat,
      children: buildCategoryTree(categories, cat._id)
    }));
};

// Get all categories
exports.getAllCategories = async (req, res) => {
  try {
    const { search, hierarchy } = req.query;
    
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
      .populate('parent', 'name slug')
      .sort({ level: 1, createdAt: -1 })
      .lean();
    
    // If hierarchy is requested, return tree structure
    if (hierarchy === 'true') {
      const tree = buildCategoryTree(categories);
      return res.status(200).json({
        success: true,
        categories: tree,
        flat: categories
      });
    }
    
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
    const { name, description, slug, parent } = req.body;
    
    // Validate required fields
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
    }
    
    // Validate parent if provided
    if (parent) {
      if (!mongoose.Types.ObjectId.isValid(parent)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid parent category ID'
        });
      }
      const parentCategory = await Category.findById(parent);
      if (!parentCategory) {
        return res.status(404).json({
          success: false,
          message: 'Parent category not found'
        });
      }
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
      parent: parent || null,
      createdBy: req.user?._id
    });
    
    await category.save();
    
    // Populate parent for response
    await category.populate('parent', 'name slug');
    
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
    const { name, description, slug, isActive, parent } = req.body;
    
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
    
    // Prevent circular reference (category cannot be its own parent or descendant)
    if (parent) {
      if (parent === id) {
        return res.status(400).json({
          success: false,
          message: 'Category cannot be its own parent'
        });
      }
      
      // Check if parent is a descendant of this category
      const checkDescendant = async (categoryId, targetId) => {
        const children = await Category.find({ parent: categoryId });
        for (const child of children) {
          if (child._id.toString() === targetId) return true;
          if (await checkDescendant(child._id, targetId)) return true;
        }
        return false;
      };
      
      if (await checkDescendant(id, parent)) {
        return res.status(400).json({
          success: false,
          message: 'Cannot set parent to a descendant category'
        });
      }
      
      // Validate parent exists
      const parentCategory = await Category.findById(parent);
      if (!parentCategory) {
        return res.status(404).json({
          success: false,
          message: 'Parent category not found'
        });
      }
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
    if (parent !== undefined) category.parent = parent || null;
    category.updatedBy = req.user?._id;
    
    await category.save();
    await category.populate('parent', 'name slug');
    
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
    
    // Check if category has children
    const childrenCount = await Category.countDocuments({ parent: id });
    if (childrenCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. It has ${childrenCount} subcategory(ies). Please delete or move them first.`
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
