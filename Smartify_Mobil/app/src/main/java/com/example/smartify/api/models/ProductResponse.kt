package com.example.smartify.api.models

import com.google.gson.annotations.SerializedName

data class ProductResponse(
    @SerializedName("success") val success: Boolean = false,
    @SerializedName("message") val message: String? = null,
    @SerializedName("data") val data: List<Product>? = emptyList()
)

// Tek bir ürün için API yanıtı
data class SingleProductResponse(
    @SerializedName("success") val success: Boolean = false,
    @SerializedName("message") val message: String? = null,
    @SerializedName("data") val data: Product? = null
) 