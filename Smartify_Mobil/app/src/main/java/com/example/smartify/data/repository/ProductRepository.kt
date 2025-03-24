package com.example.smartify.data.repository

import com.example.smartify.api.ApiService
import com.example.smartify.api.models.Product
import com.example.smartify.data.local.dao.ProductDao
import com.example.smartify.data.local.entities.toProduct
import com.example.smartify.data.local.entities.toProductEntity
import com.example.smartify.utils.NetworkResult
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import retrofit2.HttpException
import java.io.IOException
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ProductRepository @Inject constructor(
    private val apiService: ApiService,
    private val productDao: ProductDao
) {
    // Uzak sunucudan ürünleri getir
    suspend fun fetchProducts(
        page: Int = 1,
        limit: Int = 10,
        category: String? = null,
        search: String? = null,
        sort: String? = null,
        minPrice: Double? = null,
        maxPrice: Double? = null
    ): NetworkResult<List<Product>> {
        return try {
            val response = apiService.getProducts(page, limit, category, search, sort, minPrice, maxPrice)
            
            if (response.isSuccessful && response.body()?.success == true) {
                val products = response.body()?.data?.products ?: emptyList()
                
                // Ürünleri yerel veritabanına kaydet
                productDao.insertProducts(products.map { it.toProductEntity() })
                
                NetworkResult.Success(products)
            } else {
                NetworkResult.Error(response.message() ?: "Ürünler getirilirken bir hata oluştu")
            }
        } catch (e: IOException) {
            NetworkResult.Error("İnternet bağlantınızı kontrol edin")
        } catch (e: HttpException) {
            NetworkResult.Error("Sunucu hatası: ${e.message}")
        } catch (e: Exception) {
            NetworkResult.Error("Bilinmeyen bir hata oluştu: ${e.message}")
        }
    }
    
    // Uzak sunucudan ürün detayı getir
    suspend fun fetchProductById(id: String): NetworkResult<Product> {
        return try {
            val response = apiService.getProductById(id)
            
            if (response.isSuccessful && response.body()?.success == true) {
                val product = response.body()?.data
                
                if (product != null) {
                    // Ürünü yerel veritabanına kaydet
                    productDao.insertProduct(product.toProductEntity())
                    NetworkResult.Success(product)
                } else {
                    NetworkResult.Error("Ürün bulunamadı")
                }
            } else {
                NetworkResult.Error(response.message() ?: "Ürün getirilirken bir hata oluştu")
            }
        } catch (e: IOException) {
            NetworkResult.Error("İnternet bağlantınızı kontrol edin")
        } catch (e: HttpException) {
            NetworkResult.Error("Sunucu hatası: ${e.message}")
        } catch (e: Exception) {
            NetworkResult.Error("Bilinmeyen bir hata oluştu: ${e.message}")
        }
    }
    
    // Yerel veritabanından tüm ürünleri getir
    fun getProducts(): Flow<List<Product>> {
        return productDao.getAllProducts().map { entities ->
            entities.map { it.toProduct() }
        }
    }
    
    // Yerel veritabanından popüler ürünleri getir
    fun getPopularProducts(): Flow<List<Product>> {
        return productDao.getPopularProducts().map { entities ->
            entities.map { it.toProduct() }
        }
    }
    
    // Yerel veritabanından yeni ürünleri getir
    fun getNewProducts(): Flow<List<Product>> {
        return productDao.getNewProducts().map { entities ->
            entities.map { it.toProduct() }
        }
    }
    
    // Yerel veritabanından kategori bazlı ürünleri getir
    fun getProductsByCategory(category: String): Flow<List<Product>> {
        return productDao.getProductsByCategory(category).map { entities ->
            entities.map { it.toProduct() }
        }
    }
    
    // Yerel veritabanından ürün detayı getir
    fun getProductById(id: String): Flow<Product?> {
        return productDao.getProductById(id).map { entity ->
            entity?.toProduct()
        }
    }
    
    // Yerel veritabanında ürün ara
    fun searchProducts(query: String): Flow<List<Product>> {
        return productDao.searchProducts(query).map { entities ->
            entities.map { it.toProduct() }
        }
    }
} 