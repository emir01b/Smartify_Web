package com.example.smartify.api.models

import android.os.Parcelable
import com.google.gson.annotations.SerializedName
import kotlinx.parcelize.Parcelize
import kotlinx.parcelize.RawValue

@Parcelize
data class Product(
    @SerializedName("_id")
    val id: String,
    val name: String,
    val images: List<String> = listOf(),
    val price: Double,
    val oldPrice: Double? = null,
    val categoryNames: List<String> = listOf(),
    val categoryPath: List<String>? = null,
    val category: String,
    val mainCategory: String? = null,
    val isNew: Boolean = false,
    val isPopular: Boolean = false,
    val stock: Int? = 0,
    val inStock: Boolean = true, // stock > 0 ise true olarak hesaplanabilir
    val description: String = "",
    val specifications: Map<String, String> = emptyMap(),
    val features: @RawValue Any? = null, // API'den farklı formatlarda gelebilir
    val active: Boolean = true,
    val createdAt: String = "",
    val updatedAt: String = ""
) : Parcelable {
    // API'den dönen veri format uyumsuzluklarını gidermek için yardımcı extension fonksiyonlar
    
    // Features'ı güvenli bir şekilde liste olarak almak için
    fun getFeaturesList(): List<String> {
        return when (features) {
            is List<*> -> features.filterIsInstance<String>()
            is String -> listOf(features)
            else -> emptyList()
        }
    }
    
    // Stok durumunu hesaplama
    fun getStockStatus(): Boolean {
        return stock?.let { it > 0 } ?: inStock
    }
    
    // İlk görsel URL'sini alma
    fun getFirstImageUrl(): String {
        return images.firstOrNull() ?: ""
    }
} 