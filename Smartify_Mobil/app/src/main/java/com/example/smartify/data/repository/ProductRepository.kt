package com.example.smartify.data.repository

import com.example.smartify.api.ApiService
import com.example.smartify.api.models.Product
import com.example.smartify.data.local.dao.ProductDao
import com.example.smartify.data.local.entities.toProduct
import com.example.smartify.data.local.entities.toProductEntity
import com.example.smartify.utils.NetworkResult
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
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
    // Tüm ürünleri getir
    suspend fun getProducts(
        page: Int = 1,
        limit: Int = 20,
        category: String? = null,
        search: String? = null,
        sort: String? = null,
        minPrice: Double? = null,
        maxPrice: Double? = null
    ): Flow<NetworkResult<List<Product>>> = flow {
        emit(NetworkResult.Loading)
        
        try {
            val response = apiService.getProducts(page, limit, category, search, sort, minPrice, maxPrice)
            
            if (response.isSuccessful) {
                val products = response.body()
                if (products != null) {
                    emit(NetworkResult.Success(products))
                } else {
                    emit(NetworkResult.Error("Ürünler getirilirken bir hata oluştu: Boş yanıt"))
                }
            } else {
                emit(NetworkResult.Error("Sunucu yanıt hatası: ${response.code()} ${response.message()}"))
            }
        } catch (e: IOException) {
            emit(NetworkResult.Error("İnternet bağlantınızı kontrol edin"))
        } catch (e: HttpException) {
            emit(NetworkResult.Error("Sunucu hatası: ${e.message}"))
        } catch (e: Exception) {
            emit(NetworkResult.Error("Bilinmeyen bir hata oluştu: ${e.message}"))
        }
    }
    
    // Belirli bir ürünü getir (API)
    suspend fun getProductById(productId: String): Flow<NetworkResult<Product>> = flow {
        emit(NetworkResult.Loading)
        
        try {
            val response = apiService.getProductById(productId)
            
            if (response.isSuccessful) {
                val product = response.body()
                
                if (product != null) {
                    emit(NetworkResult.Success(product))
                } else {
                    emit(NetworkResult.Error("Ürün bulunamadı"))
                }
            } else {
                emit(NetworkResult.Error("Sunucu yanıt hatası: ${response.code()} ${response.message()}"))
            }
        } catch (e: IOException) {
            emit(NetworkResult.Error("İnternet bağlantınızı kontrol edin"))
        } catch (e: HttpException) {
            emit(NetworkResult.Error("Sunucu hatası: ${e.message}"))
        } catch (e: Exception) {
            emit(NetworkResult.Error("Bilinmeyen bir hata oluştu: ${e.message}"))
        }
    }
    
    // Kategoriye göre ürünleri getir (API)
    suspend fun getProductsByCategoryFromApi(category: String): Flow<NetworkResult<List<Product>>> = flow {
        emit(NetworkResult.Loading)
        
        try {
            val response = apiService.getProductsByCategory(category)
            
            if (response.isSuccessful) {
                val products = response.body()
                if (products != null) {
                    emit(NetworkResult.Success(products))
                } else {
                    emit(NetworkResult.Error("Kategori ürünleri getirilirken bir hata oluştu: Boş yanıt"))
                }
            } else {
                emit(NetworkResult.Error("Sunucu yanıt hatası: ${response.code()} ${response.message()}"))
            }
        } catch (e: IOException) {
            emit(NetworkResult.Error("İnternet bağlantınızı kontrol edin"))
        } catch (e: HttpException) {
            emit(NetworkResult.Error("Sunucu hatası: ${e.message}"))
        } catch (e: Exception) {
            emit(NetworkResult.Error("Bilinmeyen bir hata oluştu: ${e.message}"))
        }
    }
    
    // Ürün ara (API)
    suspend fun searchProductsFromApi(query: String): Flow<NetworkResult<List<Product>>> = flow {
        emit(NetworkResult.Loading)
        
        try {
            val response = apiService.searchProducts(query)
            
            if (response.isSuccessful) {
                val products = response.body()
                if (products != null) {
                    emit(NetworkResult.Success(products))
                } else {
                    emit(NetworkResult.Error("Ürün araması yapılırken bir hata oluştu: Boş yanıt"))
                }
            } else {
                emit(NetworkResult.Error("Sunucu yanıt hatası: ${response.code()} ${response.message()}"))
            }
        } catch (e: IOException) {
            emit(NetworkResult.Error("İnternet bağlantınızı kontrol edin"))
        } catch (e: HttpException) {
            emit(NetworkResult.Error("Sunucu hatası: ${e.message}"))
        } catch (e: Exception) {
            emit(NetworkResult.Error("Bilinmeyen bir hata oluştu: ${e.message}"))
        }
    }
    
    // Yerel veritabanından tüm ürünleri getir
    fun getAllProducts(): Flow<List<Product>> {
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
    fun getProductByIdFromLocal(id: String): Flow<Product?> {
        return productDao.getProductById(id).map { entity ->
            entity?.toProduct()
        }
    }
    
    // Yerel veritabanında ürün ara
    fun searchProductsFromLocal(query: String): Flow<List<Product>> {
        return productDao.searchProducts(query).map { entities ->
            entities.map { it.toProduct() }
        }
    }
} 