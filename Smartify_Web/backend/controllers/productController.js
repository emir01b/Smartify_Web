const Product = require('../models/productModel');

// @desc    Tüm ürünleri getir
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  const pageSize = 8;
  const page = Number(req.query.pageNumber) || 1;
  
  const keyword = req.query.keyword
    ? {
        name: {
          $regex: req.query.keyword,
          $options: 'i',
        },
      }
    : {};

  const category = req.query.category ? { category: req.query.category } : {};

  const count = await Product.countDocuments({ ...keyword, ...category });
  const products = await Product.find({ ...keyword, ...category })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({ products, page, pages: Math.ceil(count / pageSize) });
};

// @desc    Tek ürün getir
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error('Ürün bulunamadı');
  }
};

// @desc    Ürün sil
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    await product.remove();
    res.json({ message: 'Ürün silindi' });
  } else {
    res.status(404);
    throw new Error('Ürün bulunamadı');
  }
};

// @desc    Ürün oluştur
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  const product = new Product({
    name: 'Örnek Ürün',
    price: 0,
    user: req.user._id,
    image: '/images/sample.jpg',
    brand: 'Örnek Marka',
    category: '3D Baskı',
    countInStock: 0,
    numReviews: 0,
    description: 'Örnek açıklama',
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
};

// @desc    Ürün güncelle
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  const {
    name,
    price,
    description,
    image,
    brand,
    category,
    countInStock,
    featured
  } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    product.name = name || product.name;
    product.price = price || product.price;
    product.description = description || product.description;
    product.image = image || product.image;
    product.brand = brand || product.brand;
    product.category = category || product.category;
    product.countInStock = countInStock || product.countInStock;
    product.featured = featured !== undefined ? featured : product.featured;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error('Ürün bulunamadı');
  }
};

// @desc    Yeni değerlendirme oluştur
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = async (req, res) => {
  const { rating, comment } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      res.status(400);
      throw new Error('Ürün zaten değerlendirilmiş');
    }

    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
    };

    product.reviews.push(review);

    product.numReviews = product.reviews.length;

    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();
    res.status(201).json({ message: 'Değerlendirme eklendi' });
  } else {
    res.status(404);
    throw new Error('Ürün bulunamadı');
  }
};

// @desc    Öne çıkan ürünleri getir
// @route   GET /api/products/featured
// @access  Public
const getFeaturedProducts = async (req, res) => {
  const products = await Product.find({ featured: true }).limit(4);
  res.json(products);
};

module.exports = {
  getProducts,
  getProductById,
  deleteProduct,
  createProduct,
  updateProduct,
  createProductReview,
  getFeaturedProducts,
}; 