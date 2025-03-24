package com.example.smartify.data.repository

import com.example.smartify.api.ApiService
import com.example.smartify.api.models.Cart
import com.example.smartify.api.models.CartItem
import com.example.smartify.data.local.dao.CartDao
import com.example.smartify.data.local.entities.toCart
import com.example.smartify.data.local.entities.toCartEntity
import com.example.smartify.data.local.entities.toCartItemEntity
import com.example.smartify.utils.NetworkResult
import com.example.smartify.utils.SessionManager
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flatMapLatest
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.mapNotNull
import retrofit2.HttpException
import java.io.IOException
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class CartRepository @Inject constructor(
    private val apiService: ApiService,
    private val cartDao: CartDao,
    private val sessionManager: SessionManager
) {
    // Uzak sunucudan sepeti getir
    suspend fun fetchCart(): NetworkResult<Cart> {
        return try {
            val response = apiService.getCart()
            
            if (response.isSuccessful && response.body()?.success == true) {
                val cart = response.body()?.data
                
                if (cart != null) {
                    // Sepeti yerel veritabanına kaydet
                    val cartEntity = cart.toCartEntity()
                    cartDao.insertCart(cartEntity)
                    
                    // Sepet öğelerini temizle ve yenilerini kaydet
                    cartDao.clearCartItems(cart.id)
                    cartDao.insertCartItems(cart.items.map { it.toCartItemEntity(cart.id) })
                    
                    NetworkResult.Success(cart)
                } else {
                    NetworkResult.Error("Sepet bulunamadı")
                }
            } else {
                NetworkResult.Error(response.body()?.message ?: "Sepet getirilirken bir hata oluştu")
            }
        } catch (e: IOException) {
            NetworkResult.Error("İnternet bağlantınızı kontrol edin")
        } catch (e: HttpException) {
            NetworkResult.Error("Sunucu hatası: ${e.message}")
        } catch (e: Exception) {
            NetworkResult.Error("Bilinmeyen bir hata oluştu: ${e.message}")
        }
    }
    
    // Sepete ürün ekle
    suspend fun addToCart(cartItem: CartItem): NetworkResult<Cart> {
        return try {
            val response = apiService.addToCart(cartItem)
            
            if (response.isSuccessful && response.body()?.success == true) {
                val cart = response.body()?.data
                
                if (cart != null) {
                    // Sepeti yerel veritabanına kaydet
                    val cartEntity = cart.toCartEntity()
                    cartDao.insertCart(cartEntity)
                    
                    // Sepet öğelerini temizle ve yenilerini kaydet
                    cartDao.clearCartItems(cart.id)
                    cartDao.insertCartItems(cart.items.map { it.toCartItemEntity(cart.id) })
                    
                    NetworkResult.Success(cart)
                } else {
                    NetworkResult.Error("Sepet güncellenemedi")
                }
            } else {
                NetworkResult.Error(response.body()?.message ?: "Ürün sepete eklenirken bir hata oluştu")
            }
        } catch (e: IOException) {
            NetworkResult.Error("İnternet bağlantınızı kontrol edin")
        } catch (e: HttpException) {
            NetworkResult.Error("Sunucu hatası: ${e.message}")
        } catch (e: Exception) {
            NetworkResult.Error("Bilinmeyen bir hata oluştu: ${e.message}")
        }
    }
    
    // Sepetteki ürün miktarını güncelle
    suspend fun updateCartItemQuantity(productId: String, quantity: Int): NetworkResult<Cart> {
        return try {
            val response = apiService.updateCartItem(productId, mapOf("quantity" to quantity))
            
            if (response.isSuccessful && response.body()?.success == true) {
                val cart = response.body()?.data
                
                if (cart != null) {
                    // Sepeti yerel veritabanına kaydet
                    val cartEntity = cart.toCartEntity()
                    cartDao.insertCart(cartEntity)
                    
                    // Sepet öğelerini temizle ve yenilerini kaydet
                    cartDao.clearCartItems(cart.id)
                    cartDao.insertCartItems(cart.items.map { it.toCartItemEntity(cart.id) })
                    
                    NetworkResult.Success(cart)
                } else {
                    NetworkResult.Error("Sepet güncellenemedi")
                }
            } else {
                NetworkResult.Error(response.body()?.message ?: "Ürün miktarı güncellenirken bir hata oluştu")
            }
        } catch (e: IOException) {
            NetworkResult.Error("İnternet bağlantınızı kontrol edin")
        } catch (e: HttpException) {
            NetworkResult.Error("Sunucu hatası: ${e.message}")
        } catch (e: Exception) {
            NetworkResult.Error("Bilinmeyen bir hata oluştu: ${e.message}")
        }
    }
    
    // Sepetten ürün çıkar
    suspend fun removeFromCart(productId: String): NetworkResult<Cart> {
        return try {
            val response = apiService.removeFromCart(productId)
            
            if (response.isSuccessful && response.body()?.success == true) {
                val cart = response.body()?.data
                
                if (cart != null) {
                    // Sepeti yerel veritabanına kaydet
                    val cartEntity = cart.toCartEntity()
                    cartDao.insertCart(cartEntity)
                    
                    // Sepet öğelerini temizle ve yenilerini kaydet
                    cartDao.clearCartItems(cart.id)
                    cartDao.insertCartItems(cart.items.map { it.toCartItemEntity(cart.id) })
                    
                    NetworkResult.Success(cart)
                } else {
                    NetworkResult.Error("Sepet güncellenemedi")
                }
            } else {
                NetworkResult.Error(response.body()?.message ?: "Ürün sepetten çıkarılırken bir hata oluştu")
            }
        } catch (e: IOException) {
            NetworkResult.Error("İnternet bağlantınızı kontrol edin")
        } catch (e: HttpException) {
            NetworkResult.Error("Sunucu hatası: ${e.message}")
        } catch (e: Exception) {
            NetworkResult.Error("Bilinmeyen bir hata oluştu: ${e.message}")
        }
    }
    
    // Yerel veritabanından sepeti getir
    @OptIn(ExperimentalCoroutinesApi::class)
    fun getCart(): Flow<Cart?> {
        return sessionManager.getUserId().flatMapLatest { userId ->
            if (userId != null) {
                cartDao.getCartWithItems(userId).map { cartWithItems ->
                    cartWithItems?.let {
                        it.cart.toCart(it.items)
                    }
                }
            } else {
                kotlinx.coroutines.flow.flowOf(null)
            }
        }
    }
} 