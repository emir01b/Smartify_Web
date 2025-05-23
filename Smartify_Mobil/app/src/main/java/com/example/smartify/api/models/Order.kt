package com.example.smartify.api.models

import android.os.Parcelable
import com.google.gson.annotations.SerializedName
import kotlinx.parcelize.Parcelize

@Parcelize
data class Order(
    @SerializedName("_id")
    val id: String,
    val user: String,
    @SerializedName("orderItems")
    val items: List<OrderItem>,
    val shippingAddress: ShippingAddress,
    val paymentMethod: String,
    val totalPrice: Double,
    val shippingPrice: Double,
    val taxPrice: Double,
    val isPaid: Boolean,
    val paidAt: String? = null,
    val isDelivered: Boolean,
    val status: String,
    val createdAt: String,
    val updatedAt: String
) : Parcelable

@Parcelize
data class OrderItem(
    val product: String,
    val name: String,
    val price: Double,
    val quantity: Int,
    val image: String
) : Parcelable

@Parcelize
data class ShippingAddress(
    val firstName: String,
    val lastName: String,
    val address: String,
    val city: String,
    val postalCode: String,
    val phone: String,
    val email: String
) : Parcelable 