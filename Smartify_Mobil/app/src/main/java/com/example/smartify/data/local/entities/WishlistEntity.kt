package com.example.smartify.data.local.entities

import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey
import com.example.smartify.api.models.Wishlist
import com.example.smartify.api.models.WishlistProduct

@Entity(tableName = "wishlist")
data class WishlistEntity(
    @PrimaryKey
    val id: String,
    val userId: String,
    val createdAt: String,
    val updatedAt: String
)

@Entity(
    tableName = "wishlist_products",
    foreignKeys = [
        ForeignKey(
            entity = WishlistEntity::class,
            parentColumns = ["id"],
            childColumns = ["wishlistId"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [
        Index(value = ["wishlistId"]),
        Index(value = ["productId"])
    ]
)
data class WishlistProductEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val wishlistId: String,
    val productId: String,
    val name: String,
    val image: String,
    val price: Double
)

// Dönüştürme fonksiyonları
fun Wishlist.toWishlistEntity() = WishlistEntity(
    id = id,
    userId = userId,
    createdAt = createdAt,
    updatedAt = updatedAt
)

fun WishlistProduct.toWishlistProductEntity(wishlistId: String) = WishlistProductEntity(
    wishlistId = wishlistId,
    productId = productId,
    name = name,
    image = image,
    price = price
)

fun WishlistProductEntity.toWishlistProduct() = WishlistProduct(
    productId = productId,
    name = name,
    image = image,
    price = price
)

fun WishlistEntity.toWishlist(products: List<WishlistProductEntity>) = Wishlist(
    id = id,
    userId = userId,
    products = products.map { it.toWishlistProduct() },
    createdAt = createdAt,
    updatedAt = updatedAt
) 