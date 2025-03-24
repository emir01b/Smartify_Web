package com.example.smartify.api.models

import android.os.Parcelable
import com.google.gson.annotations.SerializedName
import kotlinx.parcelize.Parcelize

@Parcelize
data class Cart(
    @SerializedName("_id")
    val id: String,
    val userId: String,
    val items: List<CartItem>,
    val totalPrice: Double,
    val createdAt: String,
    val updatedAt: String
) : Parcelable

@Parcelize
data class CartItem(
    val productId: String,
    val name: String,
    val image: String,
    val price: Double,
    val quantity: Int
) : Parcelable 