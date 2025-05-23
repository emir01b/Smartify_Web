package com.example.smartify.data.repository

import android.util.Log
import com.example.smartify.BuildConfig
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
import java.net.SocketTimeoutException
import java.net.UnknownHostException
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ProductRepository @Inject constructor(
    private val apiService: ApiService,
    private val productDao: ProductDao
) {
    companion object {
        private const val TAG = "ProductRepository"
    }
    
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
            Log.d(TAG, "Ürünler alınıyor: API çağrısı başlatılıyor - ${BuildConfig.BASE_URL}api/products")
            Log.d(TAG, "Parametreler: page=$page, limit=$limit, category=$category, search=$search")
            
            val response = apiService.getProducts(page, limit, category, search, sort, minPrice, maxPrice)
            Log.d(TAG, "Ürünler API yanıtı: ${response.code()} - ${response.message()}")
            
            if (response.isSuccessful) {
                val products = response.body()
                if (products != null) {
                    Log.d(TAG, "Ürünler başarıyla alındı: ${products.size} ürün")
                    
                    // Ürünleri yerel veritabanına kaydetmeyi deneyelim
                    try {
                        val productEntities = products.map { it.toProductEntity() }
                        productDao.deleteAllProducts()
                        productDao.insertProducts(productEntities)
                        Log.d(TAG, "Ürünler yerel veritabanına kaydedildi")
                    } catch (e: Exception) {
                        // Veritabanı işlemleri başarısız olursa, hatayı loglayalım ama API verilerini yine de döndürelim
                        Log.e(TAG, "Ürünler veritabanına kaydedilirken hata: ${e.message}", e)
                    }
                    
                    emit(NetworkResult.Success(products))
                } else {
                    Log.e(TAG, "Ürünler boş döndü")
                    emit(NetworkResult.Error("Ürünler getirilirken bir hata oluştu: Boş yanıt"))
                }
            } else {
                val errorBody = response.errorBody()?.string()
                Log.e(TAG, "HTTP Yanıt Hatası: ${response.code()} - ${response.message()}, Body: $errorBody")
                emit(NetworkResult.Error("Sunucu yanıt hatası: ${response.code()} ${response.message()}"))
            }
        } catch (e: SocketTimeoutException) {
            Log.e(TAG, "Bağlantı zaman aşımı hatası: ${e.message}", e)
            emit(NetworkResult.Error("Sunucu yanıt vermedi, lütfen daha sonra tekrar deneyin."))
        } catch (e: UnknownHostException) {
            Log.e(TAG, "Host bulunamadı hatası: ${e.message}", e)
            emit(NetworkResult.Error("Sunucuya bağlanılamadı, internet bağlantınızı kontrol edin."))
        } catch (e: IOException) {
            Log.e(TAG, "İnternet bağlantı hatası: ${e.message}", e)
            emit(NetworkResult.Error("İnternet bağlantınızı kontrol edin."))
        } catch (e: HttpException) {
            Log.e(TAG, "HTTP İstisna: ${e.code()} - ${e.message()}", e)
            val errorMsg = when (e.code()) {
                404 -> "Ürünler bulunamadı (404)"
                500 -> "Sunucu hatası, lütfen daha sonra tekrar deneyin (500)"
                else -> "Sunucu hatası: ${e.message()} (${e.code()})"
            }
            emit(NetworkResult.Error(errorMsg))
        } catch (e: Exception) {
            Log.e(TAG, "Beklenmeyen hata: ${e.javaClass.simpleName} - ${e.message}", e)
            emit(NetworkResult.Error("Bilinmeyen bir hata oluştu: ${e.message}"))
        }
    }
    
    // Belirli bir ürünü getir (API)
    suspend fun getProductByIdFromApi(id: String): Flow<NetworkResult<Product>> = flow {
        emit(NetworkResult.Loading)
        
        try {
            Log.d(TAG, "Ürün detayı alınıyor: id=$id")
            val response = apiService.getProductById(id)
            
            if (response.isSuccessful) {
                val rawProduct = response.body()
                Log.d(TAG, "API yanıtı başarılı, alınan veri: $rawProduct")
                
                if (rawProduct != null) {
                    // API yanıtında format uyumsuzluğu varsa düzeltmeye çalış
                    val cleanedProduct = Product(
                        id = rawProduct.id,
                        name = rawProduct.name,
                        price = rawProduct.price,
                        category = rawProduct.category,
                        description = rawProduct.description ?: "",
                        images = rawProduct.images ?: emptyList(),
                        categoryNames = rawProduct.categoryNames ?: emptyList(),
                        categoryPath = rawProduct.categoryPath,
                        mainCategory = rawProduct.mainCategory,
                        isNew = rawProduct.isNew,
                        isPopular = rawProduct.isPopular,
                        stock = rawProduct.stock ?: 0,
                        inStock = rawProduct.stock?.let { it > 0 } ?: true,
                        specifications = rawProduct.specifications ?: emptyMap(),
                        features = rawProduct.features,
                        active = rawProduct.active,
                        createdAt = rawProduct.createdAt ?: "",
                        updatedAt = rawProduct.updatedAt ?: ""
                    )
                    
                    // Ürünü yerel veritabanına kaydet
                    try {
                        val productEntity = cleanedProduct.toProductEntity()
                        productDao.insertProduct(productEntity)
                        Log.d(TAG, "Ürün veritabanına kaydedildi: ${cleanedProduct.name}")
                    } catch (e: Exception) {
                        Log.e(TAG, "Ürün veritabanına kaydedilirken hata: ${e.message}", e)
                    }
                    
                    emit(NetworkResult.Success(cleanedProduct))
                } else {
                    val errorMsg = "Ürün bulunamadı: Boş yanıt"
                    Log.e(TAG, errorMsg)
                    emit(NetworkResult.Error(errorMsg))
                }
            } else {
                val errorBody = response.errorBody()?.string()
                Log.e(TAG, "Ürün detayı alınamadı. HTTP ${response.code()}: ${response.message()}, Error: $errorBody")
                emit(NetworkResult.Error("Ürün bulunamadı (${response.code()})"))
            }
        } catch (e: SocketTimeoutException) {
            Log.e(TAG, "Bağlantı zaman aşımı hatası: ${e.message}", e)
            emit(NetworkResult.Error("Sunucu yanıt vermedi, lütfen daha sonra tekrar deneyin."))
        } catch (e: UnknownHostException) {
            Log.e(TAG, "Host bulunamadı hatası: ${e.message}", e)
            emit(NetworkResult.Error("Sunucuya bağlanılamadı, internet bağlantınızı kontrol edin."))
        } catch (e: IOException) {
            Log.e(TAG, "İnternet bağlantı hatası: ${e.message}", e)
            emit(NetworkResult.Error("İnternet bağlantınızı kontrol edin"))
        } catch (e: HttpException) {
            Log.e(TAG, "HTTP İstisna: ${e.code()} - ${e.message()}", e)
            emit(NetworkResult.Error("Sunucu hatası: ${e.message}"))
        } catch (e: Exception) {
            Log.e(TAG, "Beklenmeyen hata: ${e.message}", e)
            emit(NetworkResult.Error("Bilinmeyen bir hata oluştu: ${e.message}"))
        }
    }
    
    // Kategori bazlı ürünleri getir (API)
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
                val errorBody = response.errorBody()?.string()
                Log.e(TAG, "Kategori ürünleri alınamadı. HTTP ${response.code()}: ${response.message()}, Error: $errorBody")
                emit(NetworkResult.Error("Sunucu yanıt hatası: ${response.code()} ${response.message()}"))
            }
        } catch (e: SocketTimeoutException) {
            Log.e(TAG, "Bağlantı zaman aşımı hatası: ${e.message}", e)
            emit(NetworkResult.Error("Sunucu yanıt vermedi, lütfen daha sonra tekrar deneyin."))
        } catch (e: IOException) {
            Log.e(TAG, "İnternet bağlantı hatası: ${e.message}", e)
            emit(NetworkResult.Error("İnternet bağlantınızı kontrol edin"))
        } catch (e: HttpException) {
            Log.e(TAG, "HTTP İstisna: ${e.code()} - ${e.message()}", e)
            emit(NetworkResult.Error("Sunucu hatası: ${e.message}"))
        } catch (e: Exception) {
            Log.e(TAG, "Beklenmeyen hata: ${e.message}", e)
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
                val errorBody = response.errorBody()?.string()
                Log.e(TAG, "Ürün araması yapılamadı. HTTP ${response.code()}: ${response.message()}, Error: $errorBody")
                emit(NetworkResult.Error("Sunucu yanıt hatası: ${response.code()} ${response.message()}"))
            }
        } catch (e: SocketTimeoutException) {
            Log.e(TAG, "Bağlantı zaman aşımı hatası: ${e.message}", e)
            emit(NetworkResult.Error("Sunucu yanıt vermedi, lütfen daha sonra tekrar deneyin."))
        } catch (e: IOException) {
            Log.e(TAG, "İnternet bağlantı hatası: ${e.message}", e)
            emit(NetworkResult.Error("İnternet bağlantınızı kontrol edin"))
        } catch (e: HttpException) {
            Log.e(TAG, "HTTP İstisna: ${e.code()} - ${e.message()}", e)
            emit(NetworkResult.Error("Sunucu hatası: ${e.message}"))
        } catch (e: Exception) {
            Log.e(TAG, "Beklenmeyen hata: ${e.message}", e)
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