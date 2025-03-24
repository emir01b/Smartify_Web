package com.example.smartify.api.models

import android.os.Parcelable
import com.google.gson.annotations.SerializedName
import kotlinx.parcelize.Parcelize

@Parcelize
data class Wishlist(
    @SerializedName("_id")
    val id: String,
    val userId: String,
    val products: List<WishlistProduct>,
    val createdAt: String,
    val updatedAt: String
) : Parcelable

@Parcelize
data class WishlistProduct(
    val productId: String,
    val name: String,
    val image: String,
    val price: Double
) : Parcelable 