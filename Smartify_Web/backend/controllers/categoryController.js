const Category = require('../models/Category');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

// Tüm kategorileri getir
exports.getAllCategories = catchAsync(async (req, res) => {
  const categories = await Category.find({ isActive: true })
    .select('name icon description parentId slug')
    .populate('parentId', 'name slug');

  // Kategorileri ağaç yapısına dönüştür
  const categoryTree = categories
    .filter(cat => !cat.parentId)
    .map(cat => ({
      ...cat.toObject(),
      children: buildCategoryTree(categories, cat._id)
    }));

  res.status(200).json({
    success: true,
    data: categoryTree
  });
});

// Kategori detayını getir
exports.getCategoryById = catchAsync(async (req, res) => {
  const category = await Category.findById(req.params.id)
    .populate('parentId', 'name slug');

  if (!category) {
    throw new ApiError('Kategori bulunamadı', 404);
  }

  res.status(200).json({
    success: true,
    data: category
  });
});

// Yeni kategori oluştur
exports.createCategory = catchAsync(async (req, res) => {
  const category = await Category.create(req.body);
  
  res.status(201).json({
    success: true,
    data: category
  });
});

// Kategori güncelle
exports.updateCategory = catchAsync(async (req, res) => {
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );

  if (!category) {
    throw new ApiError('Kategori bulunamadı', 404);
  }

  res.status(200).json({
    success: true,
    data: category
  });
});

// Kategori sil (soft delete)
exports.deleteCategory = catchAsync(async (req, res) => {
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );

  if (!category) {
    throw new ApiError('Kategori bulunamadı', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Kategori başarıyla silindi'
  });
});

// Yardımcı fonksiyon: Kategori ağacı oluşturma
function buildCategoryTree(categories, parentId) {
  return categories
    .filter(cat => cat.parentId && cat.parentId.toString() === parentId.toString())
    .map(cat => ({
      ...cat.toObject(),
      children: buildCategoryTree(categories, cat._id)
    }));
} 