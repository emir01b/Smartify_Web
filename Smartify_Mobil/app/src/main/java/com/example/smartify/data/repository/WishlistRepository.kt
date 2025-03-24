package com.example.smartify.data.repository

import com.example.smartify.api.ApiService
import com.example.smartify.api.models.Wishlist
import com.example.smartify.data.local.dao.WishlistDao
import com.example.smartify.data.local.entities.toWishlist
import com.example.smartify.data.local.entities.toWishlistEntity
import com.example.smartify.data.local.entities.toWishlistProductEntity
import com.example.smartify.utils.NetworkResult
import com.example.smartify.utils.SessionManager
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flatMapLatest
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.flow.map
import retrofit2.HttpException
import java.io.IOException
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class WishlistRepository @Inject constructor(
    private val apiService: ApiService,
    private val wishlistDao: WishlistDao,
    private val sessionManager: SessionManager
) {
    // Uzak sunucudan favori listesini getir
    suspend fun fetchWishlist(): NetworkResult<Wishlist> {
        return try {
            val response = apiService.getWishlist()
            
            if (response.isSuccessful && response.body()?.success == true) {
                val wishlist = response.body()?.data
                
                if (wishlist != null) {
                    // Favori listesini yerel veritabanına kaydet
                    val wishlistEntity = wishlist.toWishlistEntity()
                    wishlistDao.insertWishlist(wishlistEntity)
                    
                    // Favori ürünleri temizle ve yenilerini kaydet
                    wishlistDao.clearWishlistProducts(wishlist.id)
                    wishlistDao.insertWishlistProducts(
                        wishlist.products.map { it.toWishlistProductEntity(wishlist.id) }
                    )
                    
                    NetworkResult.Success(wishlist)
                } else {
                    NetworkResult.Error("Favori listesi bulunamadı")
                }
            } else {
                NetworkResult.Error(response.body()?.message ?: "Favori listesi getirilirken bir hata oluştu")
            }
        } catch (e: IOException) {
            NetworkResult.Error("İnternet bağlantınızı kontrol edin")
        } catch (e: HttpException) {
            NetworkResult.Error("Sunucu hatası: ${e.message}")
        } catch (e: Exception) {
            NetworkResult.Error("Bilinmeyen bir hata oluştu: ${e.message}")
        }
    }
    
    // Favori listesine ürün ekle
    suspend fun addToWishlist(productId: String): NetworkResult<Wishlist> {
        return try {
            val response = apiService.addToWishlist(mapOf("productId" to productId))
            
            if (response.isSuccessful && response.body()?.success == true) {
                val wishlist = response.body()?.data
                
                if (wishlist != null) {
                    // Favori listesini yerel veritabanına kaydet
                    val wishlistEntity = wishlist.toWishlistEntity()
                    wishlistDao.insertWishlist(wishlistEntity)
                    
                    // Favori ürünleri temizle ve yenilerini kaydet
                    wishlistDao.clearWishlistProducts(wishlist.id)
                    wishlistDao.insertWishlistProducts(
                        wishlist.products.map { it.toWishlistProductEntity(wishlist.id) }
                    )
                    
                    NetworkResult.Success(wishlist)
                } else {
                    NetworkResult.Error("Favori listesi güncellenemedi")
                }
            } else {
                NetworkResult.Error(response.body()?.message ?: "Ürün favorilere eklenirken bir hata oluştu")
            }
        } catch (e: IOException) {
            NetworkResult.Error("İnternet bağlantınızı kontrol edin")
        } catch (e: HttpException) {
            NetworkResult.Error("Sunucu hatası: ${e.message}")
        } catch (e: Exception) {
            NetworkResult.Error("Bilinmeyen bir hata oluştu: ${e.message}")
        }
    }
    
    // Favori listesinden ürün çıkar
    suspend fun removeFromWishlist(productId: String): NetworkResult<Wishlist> {
        return try {
            val response = apiService.removeFromWishlist(productId)
            
            if (response.isSuccessful && response.body()?.success == true) {
                val wishlist = response.body()?.data
                
                if (wishlist != null) {
                    // Favori listesini yerel veritabanına kaydet
                    val wishlistEntity = wishlist.toWishlistEntity()
                    wishlistDao.insertWishlist(wishlistEntity)
                    
                    // Favori ürünleri temizle ve yenilerini kaydet
                    wishlistDao.clearWishlistProducts(wishlist.id)
                    wishlistDao.insertWishlistProducts(
                        wishlist.products.map { it.toWishlistProductEntity(wishlist.id) }
                    )
                    
                    NetworkResult.Success(wishlist)
                } else {
                    NetworkResult.Error("Favori listesi güncellenemedi")
                }
            } else {
                NetworkResult.Error(response.body()?.message ?: "Ürün favorilerden çıkarılırken bir hata oluştu")
            }
        } catch (e: IOException) {
            NetworkResult.Error("İnternet bağlantınızı kontrol edin")
        } catch (e: HttpException) {
            NetworkResult.Error("Sunucu hatası: ${e.message}")
        } catch (e: Exception) {
            NetworkResult.Error("Bilinmeyen bir hata oluştu: ${e.message}")
        }
    }
    
    // Yerel veritabanından favori listesini getir
    @OptIn(ExperimentalCoroutinesApi::class)
    fun getWishlist(): Flow<Wishlist?> {
        return sessionManager.getUserId().flatMapLatest { userId ->
            if (userId != null) {
                wishlistDao.getWishlistWithProducts(userId).map { wishlistWithProducts ->
                    wishlistWithProducts?.let {
                        it.wishlist.toWishlist(it.products)
                    }
                }
            } else {
                flowOf(null)
            }
        }
    }
} 