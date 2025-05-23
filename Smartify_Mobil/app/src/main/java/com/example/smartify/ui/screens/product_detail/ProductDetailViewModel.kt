package com.example.smartify.ui.screens.product_detail

import android.util.Log
import androidx.compose.runtime.State
import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.smartify.api.models.Product
import com.example.smartify.data.repository.CartRepository
import com.example.smartify.data.repository.FavoritesRepository
import com.example.smartify.data.repository.ProductRepository
import com.example.smartify.utils.NetworkResult
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.launchIn
import kotlinx.coroutines.flow.onEach
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class ProductDetailState(
    val product: Product? = null,
    val isLoading: Boolean = false,
    val error: String? = null,
    val currentImageIndex: Int = 0,
    val quantity: Int = 1,
    val addedToCart: Boolean = false,
    val isFavorite: Boolean = false
)

@HiltViewModel
class ProductDetailViewModel @Inject constructor(
    private val productRepository: ProductRepository,
    private val cartRepository: CartRepository,
    private val favoritesRepository: FavoritesRepository,
    savedStateHandle: SavedStateHandle
) : ViewModel() {

    private val _state = mutableStateOf(ProductDetailState())
    val state: State<ProductDetailState> = _state

    private val _eventFlow = MutableStateFlow<UiEvent>(UiEvent.Idle)
    val eventFlow: StateFlow<UiEvent> = _eventFlow

    companion object {
        private const val TAG = "ProductDetailViewModel"
    }

    init {
        savedStateHandle.get<String>("productId")?.let { productId ->
            getProductById(productId)
            checkFavoriteStatus(productId)
        }
    }

    private fun getProductById(productId: String) {
        viewModelScope.launch {
            _state.value = _state.value.copy(
                isLoading = true,
                error = null
            )

            try {
                Log.d(TAG, "Ürün detayı getiriliyor: productId = $productId")
                productRepository.getProductByIdFromApi(productId).onEach { result ->
                    when (result) {
                        is NetworkResult.Success -> {
                            val product = result.data
                            Log.d(TAG, "Ürün detayı başarıyla alındı: ${product.name}")
                            Log.d(TAG, "Ürün bilgileri: id=${product.id}, price=${product.price}, " +
                                    "images=${product.images.size}, features=${product.getFeaturesList().size}, " +
                                    "categoryNames=${product.categoryNames}, stock=${product.stock}")
                            
                            _state.value = _state.value.copy(
                                product = product,
                                isLoading = false,
                                error = null
                            )
                        }
                        is NetworkResult.Error -> {
                            Log.e(TAG, "Ürün detayı alınırken hata: ${result.message}")
                            _state.value = _state.value.copy(
                                isLoading = false,
                                error = result.message
                            )
                        }
                        is NetworkResult.Loading -> {
                            Log.d(TAG, "Ürün detayı yükleniyor...")
                            _state.value = _state.value.copy(
                                isLoading = true,
                                error = null
                            )
                        }
                    }
                }.launchIn(viewModelScope)
            } catch (e: Exception) {
                Log.e(TAG, "Ürün detayı alınırken kritik hata: ${e.message}", e)
                e.printStackTrace()
                _state.value = _state.value.copy(
                    isLoading = false,
                    error = "Ürün detayı alınamadı: ${e.message ?: "Bilinmeyen hata"}"
                )
            }
        }
    }
    
    private fun checkFavoriteStatus(productId: String) {
        viewModelScope.launch {
            try {
                favoritesRepository.isProductInFavorites(productId).onEach { isFavorite ->
                    Log.d(TAG, "Ürün favori durumu: $isFavorite (productId=$productId)")
                    _state.value = _state.value.copy(isFavorite = isFavorite)
                }.launchIn(viewModelScope)
            } catch (e: Exception) {
                Log.e(TAG, "Favori durumu kontrol edilirken hata: ${e.message}", e)
            }
        }
    }
    
    // Favorilere ekle/çıkar
    private fun toggleFavorite() {
        viewModelScope.launch {
            val product = _state.value.product ?: return@launch
            val isFavorite = _state.value.isFavorite
            
            try {
                val result = if (isFavorite) {
                    favoritesRepository.removeFromFavorites(product.id)
                } else {
                    favoritesRepository.addToFavorites(product.id)
                }
                
                when (result) {
                    is NetworkResult.Success -> {
                        Log.d(TAG, "Favori durumu değiştirildi: ${!isFavorite}")
                        _state.value = _state.value.copy(isFavorite = !isFavorite)
                        
                        val message = if (!isFavorite) {
                            "Ürün favorilere eklendi"
                        } else {
                            "Ürün favorilerden çıkarıldı"
                        }
                        _eventFlow.emit(UiEvent.ShowSnackbar(message))
                    }
                    is NetworkResult.Error -> {
                        Log.e(TAG, "Favori durumu değiştirilirken hata: ${result.message}")
                        _eventFlow.emit(UiEvent.ShowSnackbar(result.message ?: "Bir hata oluştu"))
                    }
                    else -> {}
                }
            } catch (e: Exception) {
                Log.e(TAG, "Favori durumu değiştirilirken beklenmeyen hata: ${e.message}", e)
                _eventFlow.emit(UiEvent.ShowSnackbar(e.message ?: "Bir hata oluştu"))
            }
        }
    }

    fun onEvent(event: ProductDetailEvent) {
        when (event) {
            is ProductDetailEvent.ChangeQuantity -> {
                val newQuantity = _state.value.quantity + event.amount
                if (newQuantity in 1..99) { // Makul bir aralık
                    _state.value = _state.value.copy(quantity = newQuantity)
                }
            }
            is ProductDetailEvent.ChangeImage -> {
                val product = _state.value.product ?: return
                val imagesSize = product.images.size
                
                if (imagesSize <= 1) return
                
                val currentIndex = _state.value.currentImageIndex
                val newIndex = when {
                    event.next && currentIndex < imagesSize - 1 -> currentIndex + 1
                    !event.next && currentIndex > 0 -> currentIndex - 1
                    event.next -> 0 // Sondan başa dön
                    else -> imagesSize - 1 // Baştan sona git
                }
                
                _state.value = _state.value.copy(currentImageIndex = newIndex)
            }
            is ProductDetailEvent.AddToCart -> {
                viewModelScope.launch {
                    val product = _state.value.product ?: return@launch
                    val quantity = _state.value.quantity
                    
                    try {
                        val result = cartRepository.addToCart(product, quantity)
                        if (result is NetworkResult.Success) {
                            _state.value = _state.value.copy(addedToCart = true)
                            _eventFlow.emit(UiEvent.ShowSnackbar("Ürün sepete eklendi"))
                            
                            // 2 saniye sonra eklendi bilgisini sıfırla
                            launch {
                                kotlinx.coroutines.delay(2000)
                                _state.value = _state.value.copy(addedToCart = false)
                            }
                        } else if (result is NetworkResult.Error) {
                            _eventFlow.emit(UiEvent.ShowSnackbar(result.message ?: "Bir hata oluştu"))
                        }
                    } catch (e: Exception) {
                        Log.e(TAG, "Ürün sepete eklenirken hata: ${e.message}", e)
                        _eventFlow.emit(UiEvent.ShowSnackbar(e.message ?: "Bir hata oluştu"))
                    }
                }
            }
            is ProductDetailEvent.ToggleFavorite -> {
                toggleFavorite()
            }
        }
    }

    sealed class UiEvent {
        object Idle : UiEvent()
        data class ShowSnackbar(val message: String) : UiEvent()
    }
}

sealed class ProductDetailEvent {
    data class ChangeQuantity(val amount: Int) : ProductDetailEvent()
    data class ChangeImage(val next: Boolean) : ProductDetailEvent()
    object AddToCart : ProductDetailEvent()
    object ToggleFavorite : ProductDetailEvent()
} 