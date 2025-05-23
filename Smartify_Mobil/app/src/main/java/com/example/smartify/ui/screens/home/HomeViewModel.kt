package com.example.smartify.ui.screens.home

import android.util.Log
import androidx.compose.runtime.State
import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.smartify.api.models.Product
import com.example.smartify.data.repository.CartRepository
import com.example.smartify.data.repository.FavoritesRepository
import com.example.smartify.data.repository.ProductRepository
import com.example.smartify.utils.NetworkResult
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.launchIn
import kotlinx.coroutines.flow.onEach
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class HomeViewModel @Inject constructor(
    private val productRepository: ProductRepository,
    private val cartRepository: CartRepository,
    private val favoritesRepository: FavoritesRepository
) : ViewModel() {

    private val _state = mutableStateOf(HomeScreenState())
    val state: State<HomeScreenState> = _state

    private var getProductsJob: Job? = null

    // Favori ürünlerin ID'lerini tutan set
    private val _favoriteProductIds = mutableStateOf<Set<String>>(emptySet())
    val favoriteProductIds: State<Set<String>> = _favoriteProductIds

    init {
        getProducts()
        getFeaturedProducts()
        getPopularProducts()
        loadFavorites()
    }

    // Tüm ürünleri getir
    fun getProducts() {
        getProductsJob?.cancel()
        getProductsJob = viewModelScope.launch {
            try {
                productRepository.getProducts().onEach { result ->
                    when (result) {
                        is NetworkResult.Loading -> {
                            _state.value = state.value.copy(
                                isLoading = true,
                                error = null
                            )
                        }
                        is NetworkResult.Success -> {
                            val productsList = result.data
                            val featuredProductsList = productsList.filter { 
                                it.isPopular 
                            }.take(4)
                            
                            _state.value = state.value.copy(
                                products = productsList,
                                featuredProducts = featuredProductsList,
                                isLoading = false,
                                error = null
                            )
                        }
                        is NetworkResult.Error -> {
                            _state.value = state.value.copy(
                                isLoading = false,
                                error = result.message
                            )
                        }
                    }
                }.launchIn(this)
            } catch (e: Exception) {
                _state.value = state.value.copy(
                    isLoading = false,
                    error = "Beklenmeyen bir hata oluştu: ${e.message}"
                )
            }
        }
    }

    // Ürün arama
    fun searchProducts(query: String) {
        if (query.isBlank()) {
            getProducts()
            return
        }

        viewModelScope.launch {
            try {
                productRepository.searchProductsFromApi(query).onEach { result ->
                    when (result) {
                        is NetworkResult.Loading -> {
                            _state.value = state.value.copy(
                                isLoading = true,
                                error = null
                            )
                        }
                        is NetworkResult.Success -> {
                            _state.value = state.value.copy(
                                products = result.data,
                                isLoading = false,
                                error = null
                            )
                        }
                        is NetworkResult.Error -> {
                            _state.value = state.value.copy(
                                isLoading = false,
                                error = result.message
                            )
                        }
                    }
                }.launchIn(this)
            } catch (e: Exception) {
                _state.value = state.value.copy(
                    isLoading = false,
                    error = "Beklenmeyen bir hata oluştu: ${e.message}"
                )
            }
        }
    }
    
    // Ürünü sepete ekle
    fun addToCart(product: Product, quantity: Int = 1) {
        viewModelScope.launch {
            try {
                val result = cartRepository.addToCart(product, quantity)
                // Hata mesajını göstermek istiyorsanız burada işleyebilirsiniz
                if (result is NetworkResult.Error) {
                    // Hata durumunu UI'da göstermek isterseniz state'e ekleyebilirsiniz
                }
            } catch (e: Exception) {
                // Hata işleme
            }
        }
    }

    // Ekran durumunu sıfırla
    fun resetError() {
        _state.value = state.value.copy(error = null)
    }

    // Favori ürünleri yükle
    private fun loadFavorites() {
        viewModelScope.launch {
            try {
                favoritesRepository.getFavorites().onEach { result ->
                    when (result) {
                        is NetworkResult.Success -> {
                            val favoriteIds = result.data.map { it.id }.toSet()
                            _favoriteProductIds.value = favoriteIds
                            Log.d("HomeViewModel", "Favori ürünler yüklendi: ${favoriteIds.size} ürün")
                        }
                        is NetworkResult.Error -> {
                            Log.e("HomeViewModel", "Favoriler yüklenirken hata: ${result.message}")
                        }
                        is NetworkResult.Loading -> {
                            // Yükleniyor durumu
                        }
                    }
                }.launchIn(viewModelScope)
            } catch (e: Exception) {
                Log.e("HomeViewModel", "Favoriler yüklenirken beklenmeyen hata: ${e.message}", e)
            }
        }
    }
    
    // Favorilere ekleme/çıkarma işlemi
    fun toggleFavorite(productId: String) {
        viewModelScope.launch {
            try {
                val isFavorite = _favoriteProductIds.value.contains(productId)
                
                val result = if (isFavorite) {
                    favoritesRepository.removeFromFavorites(productId)
                } else {
                    favoritesRepository.addToFavorites(productId)
                }
                
                when (result) {
                    is NetworkResult.Success -> {
                        // Başarılı işlem sonrası favori listesini güncelle
                        if (isFavorite) {
                            _favoriteProductIds.value = _favoriteProductIds.value - productId
                        } else {
                            _favoriteProductIds.value = _favoriteProductIds.value + productId
                        }
                        
                        Log.d("HomeViewModel", if (isFavorite) "Ürün favorilerden çıkarıldı: $productId" else "Ürün favorilere eklendi: $productId")
                    }
                    is NetworkResult.Error -> {
                        Log.e("HomeViewModel", "Favori durumu değiştirilirken hata: ${result.message}")
                    }
                    else -> {}
                }
            } catch (e: Exception) {
                Log.e("HomeViewModel", "Favori durumu değiştirilirken beklenmeyen hata: ${e.message}", e)
            }
        }
    }
    
    // Ürünün favori olup olmadığını kontrol et
    fun isProductFavorite(productId: String): Boolean {
        return _favoriteProductIds.value.contains(productId)
    }

    private fun getFeaturedProducts() {
        viewModelScope.launch {
            try {
                // Featured products için örnek bir sorgu (isNew = true olan ürünler)
                productRepository.getProducts(sort = "price:desc", minPrice = 500.0).onEach { result ->
                    when (result) {
                        is NetworkResult.Success -> {
                            _state.value = _state.value.copy(
                                featuredProducts = result.data.filter { it.isNew },
                                isLoading = false,
                                error = null
                            )
                        }
                        is NetworkResult.Error -> {
                            // Featured products alınırken hata oldu ama diğer ürünleri etkilemeyecek
                            Log.e("HomeViewModel", "Öne çıkan ürünler alınırken hata: ${result.message}")
                        }
                        is NetworkResult.Loading -> {
                            // Yükleniyor durumu
                        }
                    }
                }.launchIn(viewModelScope)
            } catch (e: Exception) {
                Log.e("HomeViewModel", "Öne çıkan ürünler alınırken beklenmeyen hata: ${e.message}", e)
            }
        }
    }

    private fun getPopularProducts() {
        viewModelScope.launch {
            try {
                // Popular products için örnek bir sorgu (isPopular = true olan ürünler)
                productRepository.getProducts(sort = "price:asc").onEach { result ->
                    when (result) {
                        is NetworkResult.Success -> {
                            _state.value = _state.value.copy(
                                popularProducts = result.data.filter { it.isPopular },
                                isLoading = false,
                                error = null
                            )
                        }
                        is NetworkResult.Error -> {
                            // Popular products alınırken hata oldu ama diğer ürünleri etkilemeyecek
                            Log.e("HomeViewModel", "Popüler ürünler alınırken hata: ${result.message}")
                        }
                        is NetworkResult.Loading -> {
                            // Yükleniyor durumu
                        }
                    }
                }.launchIn(viewModelScope)
            } catch (e: Exception) {
                Log.e("HomeViewModel", "Popüler ürünler alınırken beklenmeyen hata: ${e.message}", e)
            }
        }
    }

    fun refreshProducts() {
        getProducts()
        getFeaturedProducts()
        getPopularProducts()
        loadFavorites()
    }
}

data class HomeScreenState(
    val products: List<Product> = emptyList(),
    val featuredProducts: List<Product> = emptyList(),
    val popularProducts: List<Product> = emptyList(),
    val isLoading: Boolean = false,
    val error: String? = null
) 