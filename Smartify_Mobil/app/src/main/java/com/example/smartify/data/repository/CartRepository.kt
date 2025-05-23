package com.example.smartify.data.repository

import android.util.Log
import com.example.smartify.api.models.Cart
import com.example.smartify.api.models.CartItem
import com.example.smartify.api.models.Product
import com.example.smartify.utils.CartManager
import com.example.smartify.utils.NetworkResult
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class CartRepository @Inject constructor(
    private val cartManager: CartManager
) {
    companion object {
        private const val TAG = "CartRepository"
    }
    
    // Sepeti getir
    suspend fun fetchCart(): NetworkResult<Cart> {
        return try {
            Log.d(TAG, "Sepet getiriliyor")
            val cart = cartManager.getCart()
            Log.d(TAG, "Sepet başarıyla alındı: ${cart.items.size} ürün")
            NetworkResult.Success(cart)
        } catch (e: Exception) {
            Log.e(TAG, "Sepet getirilirken hata: ${e.message}", e)
            NetworkResult.Error("Sepet getirilirken bir hata oluştu: ${e.message}")
        }
    }
    
    // Sepete ürün ekle
    suspend fun addToCart(product: Product, quantity: Int = 1): NetworkResult<Cart> {
        return try {
            Log.d(TAG, "Ürün sepete ekleniyor: ${product.id}, miktar: $quantity")
            val cart = cartManager.addToCart(product, quantity)
            Log.d(TAG, "Ürün başarıyla sepete eklendi: Toplam ${cart.items.size} ürün")
            NetworkResult.Success(cart)
        } catch (e: Exception) {
            Log.e(TAG, "Ürün sepete eklenirken hata: ${e.message}", e)
            NetworkResult.Error("Ürün sepete eklenirken bir hata oluştu: ${e.message}")
        }
    }
    
    // Sepet öğesinden direkt ekleme (ürün detayları belli olduğunda)
    suspend fun addToCart(cartItem: CartItem): NetworkResult<Cart> {
        return try {
            Log.d(TAG, "Ürün sepete ekleniyor: ${cartItem.productId}, miktar: ${cartItem.quantity}")
            
            // Mevcut sepet öğelerini al
            val currentItems = cartManager.getCart().items.toMutableList()
            
            // Ürün zaten sepette var mı kontrol et
            val existingItemIndex = currentItems.indexOfFirst { it.productId == cartItem.productId }
            
            if (existingItemIndex != -1) {
                // Varsa, miktarı güncelle
                val existingItem = currentItems[existingItemIndex]
                val updatedItem = existingItem.copy(quantity = existingItem.quantity + cartItem.quantity)
                return updateCartItemQuantity(cartItem.productId, updatedItem.quantity)
            } else {
                // Yeni bir ürün oluştur ve mevcut listeye ekle
                val product = Product(
                    id = cartItem.productId,
                    name = cartItem.name,
                    images = listOf(cartItem.image),
                    price = cartItem.price,
                    oldPrice = null,
                    categoryNames = emptyList(),
                    category = "",
                    mainCategory = "",
                    isNew = false,
                    isPopular = false,
                    inStock = true,
                    description = "",
                    specifications = emptyMap(),
                    createdAt = "",
                    updatedAt = ""
                )
                
                return addToCart(product, cartItem.quantity)
            }
        } catch (e: Exception) {
            Log.e(TAG, "Ürün sepete eklenirken hata: ${e.message}", e)
            NetworkResult.Error("Ürün sepete eklenirken bir hata oluştu: ${e.message}")
        }
    }
    
    // Sepetteki ürün miktarını güncelle
    suspend fun updateCartItemQuantity(productId: String, quantity: Int): NetworkResult<Cart> {
        return try {
            Log.d(TAG, "Ürün miktarı güncelleniyor: $productId, miktar: $quantity")
            val cart = cartManager.updateCartItemQuantity(productId, quantity)
            Log.d(TAG, "Ürün miktarı güncellendi, sepetteki toplam ürün: ${cart.items.size}")
            NetworkResult.Success(cart)
        } catch (e: Exception) {
            Log.e(TAG, "Ürün miktarı güncellenirken hata: ${e.message}", e)
            NetworkResult.Error("Ürün miktarı güncellenirken bir hata oluştu: ${e.message}")
        }
    }
    
    // Sepetten ürün çıkar
    suspend fun removeFromCart(productId: String): NetworkResult<Cart> {
        return try {
            Log.d(TAG, "Ürün sepetten çıkarılıyor: $productId")
            val cart = cartManager.removeFromCart(productId)
            Log.d(TAG, "Ürün sepetten çıkarıldı: ${cart.items.size} ürün kaldı")
            NetworkResult.Success(cart)
        } catch (e: Exception) {
            Log.e(TAG, "Ürün sepetten çıkarılırken hata: ${e.message}", e)
            NetworkResult.Error("Ürün sepetten çıkarılırken bir hata oluştu: ${e.message}")
        }
    }
    
    // Sepeti tamamen temizle
    suspend fun clearCart(): NetworkResult<Cart> {
        return try {
            cartManager.clearCart()
            Log.d(TAG, "Sepet tamamen temizlendi")
            NetworkResult.Success(cartManager.getCart())
        } catch (e: Exception) {
            Log.e(TAG, "Sepet temizlenirken hata: ${e.message}", e)
            NetworkResult.Error("Sepet temizlenirken bir hata oluştu: ${e.message}")
        }
    }
    
    // Sepet öğelerini Flow olarak al (gerçek zamanlı güncellemeler için)
    fun getCartItemsFlow(): Flow<List<CartItem>> {
        return cartManager.getCartItemsFlow()
    }
    
    // Sepetteki toplam ürün sayısını Flow olarak al
    fun getCartItemCountFlow(): Flow<Int> {
        return cartManager.getCartItemsFlow().map { it.size }
    }
    
    // Sepetteki toplam fiyatı Flow olarak al
    fun getCartTotalFlow(): Flow<Double> {
        return cartManager.getCartItemsFlow().map { items ->
            items.sumOf { it.price * it.quantity }
        }
    }
} 