package com.example.smartify.ui.screens.wishlist

import androidx.compose.runtime.State
import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.smartify.api.models.WishlistProduct
import com.example.smartify.data.repository.WishlistRepository
import com.example.smartify.utils.NetworkResult
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.launchIn
import kotlinx.coroutines.flow.onEach
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class WishlistViewModel @Inject constructor(
    private val wishlistRepository: WishlistRepository
) : ViewModel() {

    private val _state = mutableStateOf(WishlistScreenState())
    val state: State<WishlistScreenState> = _state

    init {
        getWishlist()
    }

    // Favori listesini getir
    fun getWishlist() {
        viewModelScope.launch {
            try {
                _state.value = state.value.copy(
                    isLoading = true,
                    error = null
                )

                wishlistRepository.getWishlist().onEach { wishlist ->
                    if (wishlist != null) {
                        _state.value = state.value.copy(
                            isLoading = false,
                            error = null,
                            wishlistItems = wishlist.products.map { it.toWishlistItem() }
                        )
                    } else {
                        _state.value = state.value.copy(
                            isLoading = false,
                            error = null,
                            wishlistItems = emptyList()
                        )
                    }
                }.launchIn(this)
            } catch (e: Exception) {
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
                val result = wishlistRepository.removeFromWishlist(productId)
                
                when (result) {
                    is NetworkResult.Success -> {
                        _state.value = state.value.copy(
                            wishlistItems = state.value.wishlistItems.filter { it.id != productId }
                        )
                    }
                    is NetworkResult.Error -> {
                        _state.value = state.value.copy(
                            error = result.message
                        )
                    }
                    else -> {}
                }
            } catch (e: Exception) {
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

// WishlistProduct'ı UI modelimiz olan WishlistItem'a dönüştüren extension fonksiyon
private fun WishlistProduct.toWishlistItem() = WishlistItem(
    id = productId,
    name = name,
    price = price,
    imageUrl = image,
    isInStock = true // API'den bu bilgiyi alamadığımız için varsayılan olarak true kullanıyoruz
)

// Ekran durumu
data class WishlistScreenState(
    val wishlistItems: List<WishlistItem> = emptyList(),
    val isLoading: Boolean = false,
    val error: String? = null
) 