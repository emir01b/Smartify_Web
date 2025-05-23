package com.example.smartify.ui.screens.wishlist

import android.util.Log
import androidx.compose.runtime.State
import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.smartify.api.models.Product
import com.example.smartify.api.toFullImageUrl
import com.example.smartify.data.repository.FavoritesRepository
import com.example.smartify.utils.NetworkResult
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.launchIn
import kotlinx.coroutines.flow.onEach
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class WishlistViewModel @Inject constructor(
    private val favoritesRepository: FavoritesRepository
) : ViewModel() {

    private val _state = mutableStateOf(WishlistScreenState())
    val state: State<WishlistScreenState> = _state
    
    companion object {
        private const val TAG = "WishlistViewModel"
    }

    init {
        getFavorites()
    }

    // Favori listesini getir
    fun getFavorites() {
        viewModelScope.launch {
            try {
                _state.value = state.value.copy(
                    isLoading = true,
                    error = null
                )

                favoritesRepository.getFavorites().onEach { result ->
                    when (result) {
                        is NetworkResult.Success -> {
                            Log.d(TAG, "Favoriler başarıyla alındı: ${result.data.size} ürün")
                            _state.value = state.value.copy(
                                isLoading = false,
                                error = null,
                                wishlistItems = result.data.map { it.toWishlistItem() }
                            )
                        }
                        is NetworkResult.Error -> {
                            Log.e(TAG, "Favoriler alınırken hata: ${result.message}")
                            _state.value = state.value.copy(
                                isLoading = false,
                                error = result.message,
                                wishlistItems = emptyList()
                            )
                        }
                        is NetworkResult.Loading -> {
                            _state.value = state.value.copy(
                                isLoading = true,
                                error = null
                            )
                        }
                    }
                }.launchIn(this)
            } catch (e: Exception) {
                Log.e(TAG, "Favoriler yüklenirken genel hata: ${e.message}", e)
                _state.value = state.value.copy(
                    isLoading = false,
                    error = "Favoriler yüklenirken bir hata oluştu: ${e.message}"
                )
            }
        }
    }

    // Favorilerden ürün çıkar
    fun removeFromWishlist(productId: String) {
        viewModelScope.launch {
            try {
                val result = favoritesRepository.removeFromFavorites(productId)
                
                when (result) {
                    is NetworkResult.Success -> {
                        Log.d(TAG, "Ürün favorilerden çıkarıldı: $productId")
                        _state.value = state.value.copy(
                            wishlistItems = state.value.wishlistItems.filter { it.id != productId }
                        )
                    }
                    is NetworkResult.Error -> {
                        Log.e(TAG, "Ürün favorilerden çıkarılırken hata: ${result.message}")
                        _state.value = state.value.copy(
                            error = result.message
                        )
                    }
                    else -> {}
                }
            } catch (e: Exception) {
                Log.e(TAG, "Ürün favorilerden çıkarılırken beklenmeyen hata: ${e.message}", e)
                _state.value = state.value.copy(
                    error = "Ürün favorilerden çıkarılırken bir hata oluştu: ${e.message}"
                )
            }
        }
    }

    // Hata mesajını temizle
    fun clearError() {
        _state.value = state.value.copy(error = null)
    }
}

// Product'ı WishlistItem'a dönüştüren extension fonksiyon
private fun Product.toWishlistItem() = WishlistItem(
    id = id,
    name = name,
    price = price,
    imageUrl = images.firstOrNull()?.toFullImageUrl() ?: "",
    isInStock = stock?.let { it > 0 } ?: inStock
)

// Ekran durumu
data class WishlistScreenState(
    val wishlistItems: List<WishlistItem> = emptyList(),
    val isLoading: Boolean = false,
    val error: String? = null
) 