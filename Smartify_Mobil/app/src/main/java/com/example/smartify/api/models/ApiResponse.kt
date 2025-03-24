package com.example.smartify.api.models

data class ApiResponse<T>(
    val success: Boolean,
    val message: String? = null,
    val data: T? = null
)

data class ProductsResponse(
    val products: List<Product>,
    val totalProducts: Int,
    val page: Int,
    val totalPages: Int
) 