package com.example.smartify.api.repository

import com.example.smartify.api.ApiService
import com.example.smartify.api.models.Product
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ProductRepository @Inject constructor(
    private val apiService: ApiService
) {
    suspend fun getProducts(
        keyword: String = "",
        category: String = "",
        pageNumber: Int = 1
    ): List<Product> {
        val response = apiService.getProducts(
            page = pageNumber,
            search = keyword.takeIf { it.isNotEmpty() },
            category = category.takeIf { it.isNotEmpty() }
        )
        
        if (response.isSuccessful && response.body() != null) {
            return response.body()!!
        } else {
            throw Exception("Ürünler yüklenirken bir hata oluştu: ${response.message()}")
        }
    }
    
    suspend fun getProductById(id: String): Product {
        val response = apiService.getProductById(id)
        if (response.isSuccessful && response.body() != null) {
            return response.body()!!
        } else {
            throw Exception("Ürün bulunamadı: ${response.message()}")
        }
    }
    
    suspend fun getFeaturedProducts(): List<Product> {
        val response = apiService.getProductsByCategory("featured")
        if (response.isSuccessful && response.body() != null) {
            return response.body()!!
        } else {
            throw Exception("Öne çıkan ürünler yüklenirken bir hata oluştu: ${response.message()}")
        }
    }
    
    // Ürünleri kategoriye göre getir
    suspend fun getProductsByCategory(category: String): List<Product> {
        val response = apiService.getProductsByCategory(category)
        if (response.isSuccessful && response.body() != null) {
            return response.body()!!
        } else {
            throw Exception("Kategoride ürün bulunamadı: ${response.message()}")
        }
    }
    
    // Ürünleri anahtar kelimeye göre ara
    suspend fun searchProducts(query: String): List<Product> {
        val response = apiService.searchProducts(query)
        if (response.isSuccessful && response.body() != null) {
            return response.body()!!
        } else {
            throw Exception("Arama sonuçları bulunamadı: ${response.message()}")
        }
    }
} 