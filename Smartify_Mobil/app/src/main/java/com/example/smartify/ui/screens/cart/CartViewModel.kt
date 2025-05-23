package com.example.smartify.ui.screens.cart

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.smartify.api.models.CartItem
import com.example.smartify.data.repository.CartRepository
import com.example.smartify.utils.NetworkResult
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class CartState(
    val isLoading: Boolean = false,
    val cartItems: List<CartItem> = emptyList(),
    val error: String? = null
)

@HiltViewModel
class CartViewModel @Inject constructor(
    private val cartRepository: CartRepository
) : ViewModel() {

    private val _state = MutableStateFlow(CartState())
    val state: StateFlow<CartState> = _state
    
    companion object {
        private const val TAG = "CartViewModel"
    }

    init {
        fetchCart()
        
        // Sepet değişikliklerini izle
        viewModelScope.launch {
            cartRepository.getCartItemsFlow().collect { items ->
                _state.update { currentState ->
                    // Eğer bir hata durumu veya yükleme durumu yoksa, sepet öğelerini güncelle
                    if (!currentState.isLoading && currentState.error == null) {
                        currentState.copy(cartItems = items)
                    } else {
                        currentState
                    }
                }
            }
        }
    }

    fun fetchCart() {
        viewModelScope.launch {
            _state.update { it.copy(isLoading = true, error = null) }
            
            try {
                Log.d(TAG, "Sepet verisi getiriliyor...")
                when (val result = cartRepository.fetchCart()) {
                    is NetworkResult.Success -> {
                        Log.d(TAG, "Sepet verisi başarıyla getirildi: ${result.data.items.size} ürün")
                        _state.update { 
                            it.copy(
                                isLoading = false,
                                cartItems = result.data.items,
                                error = null
                            )
                        }
                        
                        // Ürünlerin bilgilerini logla
                        result.data.items.forEachIndexed { index, item ->
                            Log.d(TAG, "Ürün #$index - ID: ${item.productId}, Ad: ${item.name}, Fiyat: ${item.price}, Miktar: ${item.quantity}")
                        }
                    }
                    is NetworkResult.Error -> {
                        Log.e(TAG, "Sepet verisi getirilirken hata: ${result.message}")
                        _state.update { 
                            it.copy(
                                isLoading = false,
                                error = result.message
                            )
                        }
                    }
                    is NetworkResult.Loading -> {
                        // Zaten isLoading true olarak ayarlandı
                        Log.d(TAG, "Sepet verisi yükleniyor...")
                    }
                }
            } catch (e: Exception) {
                Log.e(TAG, "Sepet verisi getirilirken exception: ${e.message}", e)
                _state.update { 
                    it.copy(
                        isLoading = false,
                        error = e.message ?: "Bilinmeyen bir hata oluştu"
                    )
                }
            }
        }
    }

    fun updateCartItemQuantity(productId: String, quantity: Int) {
        viewModelScope.launch {
            try {
                Log.d(TAG, "Ürün miktarı güncelleniyor: $productId, miktar: $quantity")
                when (val result = cartRepository.updateCartItemQuantity(productId, quantity)) {
                    is NetworkResult.Success -> {
                        Log.d(TAG, "Ürün miktarı güncellendi: ${result.data.items.size} ürün")
                        _state.update { 
                            it.copy(
                                cartItems = result.data.items,
                                error = null
                            )
                        }
                    }
                    is NetworkResult.Error -> {
                        Log.e(TAG, "Ürün miktarı güncellenirken hata: ${result.message}")
                        _state.update { 
                            it.copy(error = result.message)
                        }
                    }
                    is NetworkResult.Loading -> {
                        // Loading durumunu işlemeye gerek yok
                    }
                }
            } catch (e: Exception) {
                Log.e(TAG, "Ürün miktarı güncellenirken exception: ${e.message}", e)
                _state.update { 
                    it.copy(error = e.message ?: "Bilinmeyen bir hata oluştu")
                }
                // Yeniden yükleme yapılmasına gerek yok, zaten flow güncellenecektir
            }
        }
    }

    fun removeFromCart(productId: String) {
        viewModelScope.launch {
            try {
                Log.d(TAG, "Ürün sepetten çıkarılıyor: $productId")
                when (val result = cartRepository.removeFromCart(productId)) {
                    is NetworkResult.Success -> {
                        Log.d(TAG, "Ürün sepetten çıkarıldı: ${result.data.items.size} ürün kaldı")
                        _state.update { 
                            it.copy(
                                cartItems = result.data.items,
                                error = null
                            )
                        }
                    }
                    is NetworkResult.Error -> {
                        Log.e(TAG, "Ürün sepetten çıkarılırken hata: ${result.message}")
                        _state.update { 
                            it.copy(error = result.message)
                        }
                    }
                    is NetworkResult.Loading -> {
                        // Loading durumunu işlemeye gerek yok
                    }
                }
            } catch (e: Exception) {
                Log.e(TAG, "Ürün sepetten çıkarılırken exception: ${e.message}", e)
                _state.update { 
                    it.copy(error = e.message ?: "Bilinmeyen bir hata oluştu")
                }
                // Yeniden yükleme yapılmasına gerek yok, zaten flow güncellenecektir
            }
        }
    }
    
    fun clearCart() {
        viewModelScope.launch {
            try {
                Log.d(TAG, "Sepet temizleniyor")
                when (val result = cartRepository.clearCart()) {
                    is NetworkResult.Success -> {
                        Log.d(TAG, "Sepet temizlendi")
                        _state.update { 
                            it.copy(
                                cartItems = emptyList(),
                                error = null
                            )
                        }
                    }
                    is NetworkResult.Error -> {
                        Log.e(TAG, "Sepet temizlenirken hata: ${result.message}")
                        _state.update { 
                            it.copy(error = result.message)
                        }
                    }
                    is NetworkResult.Loading -> {
                        // Loading durumunu işlemeye gerek yok
                    }
                }
            } catch (e: Exception) {
                Log.e(TAG, "Sepet temizlenirken exception: ${e.message}", e)
                _state.update { 
                    it.copy(error = e.message ?: "Bilinmeyen bir hata oluştu")
                }
            }
        }
    }
} 