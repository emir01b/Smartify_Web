package com.example.smartify.ui.screens.home

import androidx.compose.runtime.State
import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.smartify.api.models.Product
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
    private val productRepository: ProductRepository
) : ViewModel() {

    private val _state = mutableStateOf(HomeScreenState())
    val state: State<HomeScreenState> = _state

    private var getProductsJob: Job? = null
    private var getProductsByCategoryJob: Job? = null

    init {
        getProducts()
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
                                error = null,
                                selectedCategory = "Tüm Ürünler"
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

    // Kategoriye göre ürünleri getir
    fun getProductsByCategory(category: String) {
        if (category == "Tüm Ürünler") {
            getProducts()
            return
        }

        getProductsByCategoryJob?.cancel()
        getProductsByCategoryJob = viewModelScope.launch {
            try {
                productRepository.getProductsByCategoryFromApi(category).onEach { result ->
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
                                error = null,
                                selectedCategory = category
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

    // Ekran durumunu sıfırla
    fun resetError() {
        _state.value = state.value.copy(error = null)
    }
}

data class HomeScreenState(
    val products: List<Product> = emptyList(),
    val featuredProducts: List<Product> = emptyList(),
    val categories: List<String> = listOf(
        "Tüm Ürünler",
        "3D Yazıcılar",
        "Akıllı Ev",
        "3D Modeller",
        "Sensörler",
        "Aksesuarlar"
    ),
    val selectedCategory: String = "Tüm Ürünler",
    val isLoading: Boolean = false,
    val error: String? = null
) 