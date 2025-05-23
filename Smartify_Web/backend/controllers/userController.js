const User = require('../models/User');
const jwt = require('jsonwebtoken');

// JWT token oluşturma
const generateToken = (id) => {
  return jwt.sign({ userId: id }, process.env.JWT_SECRET || 'smartify-jwt-secret', {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

// @desc    Kullanıcı kimlik doğrulama & token alma
// @route   POST /api/users/login
// @access  Public
const authUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.comparePassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error('Geçersiz email veya şifre');
  }
};

// @desc    Yeni kullanıcı kayıt
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('Kullanıcı zaten var');
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Geçersiz kullanıcı bilgileri');
  }
};

// @desc    Kullanıcı profilini getir
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      address: user.address,
      phone: user.phone,
    });
  } else {
    res.status(404);
    throw new Error('Kullanıcı bulunamadı');
  }
};

// @desc    Kullanıcı profilini güncelle
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    
    if (req.body.address) {
      user.address = {
        street: req.body.address.street || user.address?.street,
        city: req.body.address.city || user.address?.city,
        postalCode: req.body.address.postalCode || user.address?.postalCode,
        country: req.body.address.country || user.address?.country,
      };
    }
    
    user.phone = req.body.phone || user.phone;
    
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      address: updatedUser.address,
      phone: updatedUser.phone,
      token: generateToken(updatedUser._id),
    });
  } else {
    res.status(404);
    throw new Error('Kullanıcı bulunamadı');
  }
};

// @desc    Tüm kullanıcıları getir
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  const users = await User.find({});
  res.json(users);
};

// @desc    Kullanıcı sil
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    await user.remove();
    res.json({ message: 'Kullanıcı silindi' });
  } else {
    res.status(404);
    throw new Error('Kullanıcı bulunamadı');
  }
};

// @desc    Kullanıcının favori ürünlerini getir
// @route   GET /api/users/favorites
// @access  Private
const getFavorites = async (req, res) => {
  try {
    console.log('getFavorites çağrıldı, user ID:', req.user._id);
    
    // Tüm alanları içeren populate işlemi
    const user = await User.findById(req.user._id).populate({
      path: 'favorites',
      model: 'Product'
    });
    
    if (!user) {
      console.log('Kullanıcı bulunamadı');
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    
    console.log('Kullanıcı favorileri sayısı:', user.favorites ? user.favorites.length : 0);
    console.log('Favorileri istenen kullanıcı:', user.name, user.email);
    
    // Hata ayıklama: Favoriler dizisini kontrol et
    if (!user.favorites || user.favorites.length === 0) {
      console.log('Kullanıcının favorileri yok');
      return res.json([]);
    }
    
    // Favoriler array içindeyse - çift gösterilme sorununu önlemek için
    const uniqueFavorites = [];
    const seenIds = new Set();
    
    // Çift kayıtları temizle
    if (Array.isArray(user.favorites)) {
      user.favorites.forEach(item => {
        const id = item._id ? item._id.toString() : (typeof item === 'string' ? item : null);
        if (id && !seenIds.has(id)) {
          seenIds.add(id);
          uniqueFavorites.push(item);
        }
      });
      
      console.log('Çift kayıtlar temizlendi. Benzersiz ürün sayısı:', uniqueFavorites.length);
    }
    
    // Favorilerde sadece ID'ler varsa, manual olarak ürünleri getir
    if (uniqueFavorites.length > 0 && typeof uniqueFavorites[0] === 'string') {
      console.log('Favori ID\'leri tam objelerle populate edilmemiş, manuel olarak ürünleri getiriyoruz...');
      
      const Product = require('../models/Product');
      const productIds = [...seenIds]; // Benzersiz ID'leri kullan
      const products = await Product.find({ _id: { $in: productIds } });
      
      console.log('Bulunan ürün sayısı:', products.length);
      return res.json(products);
    }
    
    console.log('Populate başarılı, benzersiz favorileri gönderiyoruz');
    res.json(uniqueFavorites);
  } catch (error) {
    console.error('Favorileri getirme hatası:', error);
    res.status(500).json({ message: 'Favoriler getirilirken bir hata oluştu', error: error.message });
  }
};

// @desc    Ürünü favorilere ekle
// @route   POST /api/users/favorites/:productId
// @access  Private
const addToFavorites = async (req, res) => {
  try {
    const productId = req.params.productId;
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    
    // Favoriler array'i yoksa oluştur
    if (!user.favorites) {
      user.favorites = [];
    }
    
    // Ürün zaten favorilerde mi kontrol et - string ve ObjectId durumunu kontrol eder
    const isAlreadyFavorite = user.favorites.some(id => 
      id.toString() === productId || id === productId
    );
    
    if (isAlreadyFavorite) {
      return res.status(400).json({ message: 'Ürün zaten favorilerde' });
    }
    
    // Favorilere ekle
    user.favorites.push(productId);
    await user.save();
    
    console.log(`Ürün ID:${productId} kullanıcı ${user.name} favorilerine eklendi`);
    
    res.status(200).json({ message: 'Ürün favorilere eklendi', favorites: user.favorites });
  } catch (error) {
    console.error('Favorilere eklerken bir hata oluştu:', error);
    res.status(500).json({ message: 'Favorilere eklerken bir hata oluştu', error: error.message });
  }
};

// @desc    Ürünü favorilerden çıkar
// @route   DELETE /api/users/favorites/:productId
// @access  Private
const removeFromFavorites = async (req, res) => {
  try {
    const productId = req.params.productId;
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    
    // Favoriler array'i yoksa hata döndür
    if (!user.favorites || user.favorites.length === 0) {
      return res.status(400).json({ message: 'Kullanıcının favorileri bulunmuyor' });
    }
    
    // Ürün favorilerde mi kontrol et - string ve ObjectId durumunu kontrol eder
    const isInFavorites = user.favorites.some(id => 
      id.toString() === productId || id === productId
    );
    
    if (!isInFavorites) {
      return res.status(400).json({ message: 'Ürün favorilerde bulunamadı' });
    }
    
    // Favorilerden çıkar - hem string hem de ObjectId durumlarını kontrol et
    user.favorites = user.favorites.filter(id => 
      id.toString() !== productId && id !== productId
    );
    
    await user.save();
    
    console.log(`Ürün ID:${productId} kullanıcı ${user.name} favorilerinden çıkarıldı`);
    
    res.status(200).json({ message: 'Ürün favorilerden çıkarıldı', favorites: user.favorites });
  } catch (error) {
    console.error('Favorilerden çıkarırken bir hata oluştu:', error);
    res.status(500).json({ message: 'Favorilerden çıkarırken bir hata oluştu', error: error.message });
  }
};

module.exports = {
  authUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  deleteUser,
  getFavorites,
  addToFavorites,
  removeFromFavorites
}; 