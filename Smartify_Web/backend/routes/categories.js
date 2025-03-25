const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { categories } = require('../utils/categories');

// Kategorileri getir - Herkese açık
router.get('/', async (req, res, next) => {
    try {
        // Kategorileri doğrudan döndür
        res.json(categories);
    } catch (error) {
        console.error('Kategorileri getirme hatası:', error);
        next(error);
    }
});

module.exports = router; 