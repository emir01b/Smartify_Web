package com.example.smartify.utils

import android.content.Context
import android.util.Log
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import com.example.smartify.api.models.Cart
import com.example.smartify.api.models.CartItem
import com.example.smartify.api.models.Product
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import java.util.UUID
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class CartManager @Inject constructor(@ApplicationContext context: Context) {
    
    private val dataStore = context.dataStore
    private val gson = Gson()
    
    companion object {
        private const val TAG = "CartManager"
        val CART_ITEMS_KEY = stringPreferencesKey(Constants.KEY_CART_ITEMS)
        val CART_ID_KEY = stringPreferencesKey(Constants.KEY_CART_ID)
    }
    
    /**
     * Sepeti DataStore'dan getirir
     */
    suspend fun getCart(): Cart {
        val userId = getOrCreateUserId()
        val cartId = getOrCreateCartId()
        val cartItems = getCartItems()
        
        return Cart(
            id = cartId,
            userId = userId,
            items = cartItems,
            totalPrice = calculateTotalPrice(cartItems),
            createdAt = System.currentTimeMillis().toString(),
            updatedAt = System.currentTimeMillis().toString()
        )
    }
    
    /**
     * Sepet öğelerini Flow olarak döndürür
     */
    fun getCartItemsFlow(): Flow<List<CartItem>> {
        return dataStore.data.map { preferences ->
            val cartItemsJson = preferences[CART_ITEMS_KEY] ?: "[]"
            parseCartItems(cartItemsJson)
        }
    }
    
    /**
     * Sepet öğelerini DataStore'dan getirir
     */
    private suspend fun getCartItems(): List<CartItem> {
        val preferences = dataStore.data.first()
        val cartItemsJson = preferences[CART_ITEMS_KEY] ?: "[]"
        return parseCartItems(cartItemsJson)
    }
    
    /**
     * JSON'dan CartItem listesine dönüştürür
     */
    private fun parseCartItems(json: String): List<CartItem> {
        return try {
            val type = object : TypeToken<List<CartItem>>() {}.type
            gson.fromJson(json, type) ?: emptyList()
        } catch (e: Exception) {
            Log.e(TAG, "Sepet öğeleri ayrıştırılırken hata: ${e.message}", e)
            emptyList()
        }
    }
    
    /**
     * Sepet öğelerinin toplam fiyatını hesaplar
     */
    private fun calculateTotalPrice(items: List<CartItem>): Double {
        return items.sumOf { it.price * it.quantity }
    }
    
    /**
     * Sepet kimliğini getirir, yoksa yeni bir tane oluşturur
     */
    private suspend fun getOrCreateCartId(): String {
        val preferences = dataStore.data.first()
        val cartId = preferences[CART_ID_KEY]
        
        if (cartId != null) {
            return cartId
        }
        
        val newCartId = "cart_${UUID.randomUUID()}"
        dataStore.edit { it[CART_ID_KEY] = newCartId }
        return newCartId
    }
    
    /**
     * Kullanıcı kimliğini SessionManager'dan getirir, yoksa misafir kullanıcı döndürür
     */
    private suspend fun getOrCreateUserId(): String {
        try {
            val preferences = dataStore.data.first()
            val userIdKey = stringPreferencesKey(Constants.KEY_USER_ID)
            val userId = preferences[userIdKey]
            
            if (!userId.isNullOrEmpty()) {
                return userId
            }
        } catch (e: Exception) {
            Log.e(TAG, "Kullanıcı ID'si alınırken hata: ${e.message}", e)
        }
        
        return "guest_user"
    }
    
    /**
     * Ürünü sepete ekler
     */
    suspend fun addToCart(product: Product, quantity: Int = 1): Cart {
        val cartItems = getCartItems().toMutableList()
        
        // Ürün zaten sepette var mı diye kontrol et
        val existingItemIndex = cartItems.indexOfFirst { it.productId == product.id }
        
        if (existingItemIndex != -1) {
            // Varsa miktarı güncelle
            val existingItem = cartItems[existingItemIndex]
            val updatedItem = existingItem.copy(quantity = existingItem.quantity + quantity)
            cartItems[existingItemIndex] = updatedItem
        } else {
            // Yoksa yeni ekle
            val newItem = CartItem(
                productId = product.id,
                name = product.name,
                image = product.images.firstOrNull() ?: "",
                price = product.price,
                quantity = quantity
            )
            cartItems.add(newItem)
        }
        
        // Sepeti güncelle
        saveCartItems(cartItems)
        
        // Güncel sepeti döndür
        return getCart()
    }
    
    /**
     * Sepet öğesinin miktarını günceller
     */
    suspend fun updateCartItemQuantity(productId: String, quantity: Int): Cart {
        if (quantity <= 0) {
            return removeFromCart(productId)
        }
        
        val cartItems = getCartItems().toMutableList()
        val itemIndex = cartItems.indexOfFirst { it.productId == productId }
        
        if (itemIndex != -1) {
            val item = cartItems[itemIndex]
            cartItems[itemIndex] = item.copy(quantity = quantity)
            saveCartItems(cartItems)
        }
        
        return getCart()
    }
    
    /**
     * Ürünü sepetten çıkarır
     */
    suspend fun removeFromCart(productId: String): Cart {
        val cartItems = getCartItems().filterNot { it.productId == productId }
        saveCartItems(cartItems)
        return getCart()
    }
    
    /**
     * Sepeti tamamen temizler
     */
    suspend fun clearCart() {
        saveCartItems(emptyList())
    }
    
    /**
     * Sepet öğelerini DataStore'a kaydeder
     */
    private suspend fun saveCartItems(items: List<CartItem>) {
        try {
            val cartItemsJson = gson.toJson(items)
            dataStore.edit { preferences ->
                preferences[CART_ITEMS_KEY] = cartItemsJson
            }
            Log.d(TAG, "Sepet başarıyla kaydedildi: ${items.size} öğe")
        } catch (e: Exception) {
            Log.e(TAG, "Sepet kaydedilirken hata: ${e.message}", e)
        }
    }
} 