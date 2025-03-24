package com.example.smartify.data.local.entities

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.example.smartify.api.models.Product

@Entity(tableName = "products")
data class ProductEntity(
    @PrimaryKey
    val id: String,
    val name: String,
    val images: List<String>,
    val price: Double,
    val oldPrice: Double?,
    val categoryNames: List<String>,
    val category: String,
    val mainCategory: String,
    val isNew: Boolean,
    val isPopular: Boolean,
    val inStock: Boolean,
    val description: String,
    val specifications: Map<String, String>,
    val createdAt: String,
    val updatedAt: String
)

// Uzak sunucudan gelen modeli yerel veritabanı modeline dönüştürme
fun Product.toProductEntity() = ProductEntity(
    id = id,
    name = name,
    images = images,
    price = price,
    oldPrice = oldPrice,
    categoryNames = categoryNames,
    category = category,
    mainCategory = mainCategory,
    isNew = isNew,
    isPopular = isPopular,
    inStock = inStock,
    description = description,
    specifications = specifications,
    createdAt = createdAt,
    updatedAt = updatedAt
)

// Yerel veritabanı modelini uzak sunucu modeline dönüştürme
fun ProductEntity.toProduct() = Product(
    id = id,
    name = name,
    images = images,
    price = price,
    oldPrice = oldPrice,
    categoryNames = categoryNames,
    category = category,
    mainCategory = mainCategory,
    isNew = isNew,
    isPopular = isPopular,
    inStock = inStock,
    description = description,
    specifications = specifications,
    createdAt = createdAt,
    updatedAt = updatedAt
) 