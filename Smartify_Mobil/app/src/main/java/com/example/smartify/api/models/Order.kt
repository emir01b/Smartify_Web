package com.example.smartify.api.models

import android.os.Parcelable
import com.google.gson.annotations.SerializedName
import kotlinx.parcelize.Parcelize

@Parcelize
data class Order(
    @SerializedName("_id")
    val id: String,
    val userId: String,
    val items: List<OrderItem>,
    val totalPrice: Double,
    val shippingAddress: Address,
    val paymentMethod: String,
    val paymentStatus: String,
    val orderStatus: String,
    val trackingNumber: String? = null,
    val createdAt: String,
    val updatedAt: String
) : Parcelable

@Parcelize
data class OrderItem(
    val productId: String,
    val name: String,
    val image: String,
    val price: Double,
    val quantity: Int
) : Parcelable 