package com.example.smartify.api.models

import android.os.Parcelable
import com.google.gson.annotations.SerializedName
import kotlinx.parcelize.Parcelize

@Parcelize
data class Product(
    @SerializedName("_id")
    val id: String,
    val name: String,
    val images: List<String>,
    val price: Double,
    val oldPrice: Double? = null,
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
) : Parcelable 