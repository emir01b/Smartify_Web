package com.example.smartify.api.models

import com.google.gson.annotations.SerializedName

data class ApiResponse<T>(
    @SerializedName("success") val success: Boolean = false,
    @SerializedName("message") val message: String? = null,
    @SerializedName("data") val data: T? = null
)

data class ProductsResponse(
    val products: List<Product>,
    val totalProducts: Int,
    val page: Int,
    val totalPages: Int
) 