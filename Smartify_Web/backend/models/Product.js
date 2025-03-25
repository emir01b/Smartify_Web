const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    category: {
        type: String,
        required: true
    },
    mainCategory: {
        type: String,
        required: true
    },
    categoryPath: {
        type: [String],
        required: true
    },
    categoryNames: {
        type: [String],
        required: true
    },
    images: {
        type: [String],
        default: []
    },
    stock: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    isNew: {
        type: Boolean,
        default: false
    },
    isPopular: {
        type: Boolean,
        default: false
    },
    features: {
        type: [String],
        default: []
    },
    specifications: {
        type: Object,
        default: {}
    },
    active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Arama için index oluştur
productSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema); 