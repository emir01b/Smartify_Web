package com.example.smartify.data.local.entities

import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey
import com.example.smartify.api.models.Cart
import com.example.smartify.api.models.CartItem

@Entity(tableName = "cart")
data class CartEntity(
    @PrimaryKey
    val id: String,
    val userId: String,
    val totalPrice: Double,
    val createdAt: String,
    val updatedAt: String
)

@Entity(
    tableName = "cart_items",
    foreignKeys = [
        ForeignKey(
            entity = CartEntity::class,
            parentColumns = ["id"],
            childColumns = ["cartId"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [
        Index(value = ["cartId"]),
        Index(value = ["productId"])
    ]
)
data class CartItemEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val cartId: String,
    val productId: String,
    val name: String,
    val image: String,
    val price: Double,
    val quantity: Int
)

// Dönüştürme fonksiyonları
fun Cart.toCartEntity() = CartEntity(
    id = id,
    userId = userId,
    totalPrice = totalPrice,
    createdAt = createdAt,
    updatedAt = updatedAt
)

fun CartItem.toCartItemEntity(cartId: String) = CartItemEntity(
    cartId = cartId,
    productId = productId,
    name = name,
    image = image,
    price = price,
    quantity = quantity
)

fun CartItemEntity.toCartItem() = CartItem(
    productId = productId,
    name = name,
    image = image,
    price = price,
    quantity = quantity
)

fun CartEntity.toCart(items: List<CartItemEntity>) = Cart(
    id = id,
    userId = userId,
    items = items.map { it.toCartItem() },
    totalPrice = totalPrice,
    createdAt = createdAt,
    updatedAt = updatedAt
) 