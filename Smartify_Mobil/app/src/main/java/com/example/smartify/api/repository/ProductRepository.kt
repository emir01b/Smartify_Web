package com.example.smartify.api.repository

import com.example.smartify.api.ApiService
import com.example.smartify.api.models.Product
import javax.inject.Inject
import javax.inject.Singleton
import android.util.Log

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
        Log.d("ProductRepository", "Kategori isteği başlatıldı: $category")
        
        // Önce tüm ürünleri al
        val response = apiService.getProducts(limit = 100) // Tüm ürünleri almak için limit yüksek
        
        Log.d("ProductRepository", "API yanıtı: isSuccessful=${response.isSuccessful}, code=${response.code()}")
        if (!response.isSuccessful) {
            Log.e("ProductRepository", "API Hata: ${response.errorBody()?.string()}")
            throw Exception("Ürünler getirilemedi: ${response.message()}")
        }
        
        if (response.body() != null) {
            val allProducts = response.body()!!
            Log.d("ProductRepository", "Toplam ürün sayısı: ${allProducts.size}")
            
            // Kategori filtrelemesi
            val filteredProducts = allProducts.filter { product ->
                product.category.equals(category, ignoreCase = true) ||
                product.mainCategory.equals(category, ignoreCase = true) ||
                product.categoryNames.any { it.equals(category, ignoreCase = true) }
            }
            
            Log.d("ProductRepository", "Filtrelenmiş ürün sayısı: ${filteredProducts.size}")
            
            if (filteredProducts.isEmpty()) {
                Log.w("ProductRepository", "Bu kategoride ürün bulunamadı: $category")
                throw Exception("Bu kategoride ürün bulunamadı")
            }
            
            return filteredProducts
        } else {
            val errorMessage = "Ürünler getirilemedi"
            Log.e("ProductRepository", errorMessage)
            throw Exception(errorMessage)
        }
    }
    
    // Ürünleri anahtar kelimeye göre ara
    suspend fun searchProducts(query: String): List<Product> {
        Log.d("ProductRepository", "Ürün araması başlatıldı: '$query'")
        
        try {
            val response = apiService.searchProducts(query)
            
            Log.d("ProductRepository", "Arama yanıtı: isSuccessful=${response.isSuccessful}, code=${response.code()}")
            
            if (response.isSuccessful && response.body() != null) {
                val products = response.body()!!
                Log.d("ProductRepository", "Arama başarılı, ${products.size} ürün bulundu")
                return products
            } else {
                val errorBody = response.errorBody()?.string()
                Log.e("ProductRepository", "Ürün araması yapılamadı. HTTP ${response.code()}: ${response.message()}, Error: $errorBody")
                
                if (response.code() == 500) {
                    throw Exception("Sunucu hatası: Arama şu anda kullanılamıyor")
                }
                
                throw Exception("Arama sonuçları bulunamadı: ${response.message()}")
            }
        } catch (e: Exception) {
            Log.e("ProductRepository", "Ürün araması sırasında hata: ${e.message}", e)
            throw e
        }
    }
} 