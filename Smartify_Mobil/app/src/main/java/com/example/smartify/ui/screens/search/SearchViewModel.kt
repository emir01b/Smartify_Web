package com.example.smartify.ui.screens.search

import androidx.compose.runtime.State
import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.smartify.api.models.Product
import com.example.smartify.api.repository.ProductRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import javax.inject.Inject

data class SearchState(
    val products: List<Product> = emptyList(),
    val isLoading: Boolean = false,
    val error: String? = null
)

@HiltViewModel
class SearchViewModel @Inject constructor(
    private val productRepository: ProductRepository
) : ViewModel() {
    
    private val _state = mutableStateOf(SearchState(isLoading = true))
    val state: State<SearchState> = _state
    
    private var searchJob: Job? = null
    
    init {
        // İlk açılışta tüm ürünleri yükle
        getAllProducts()
    }
    
    fun searchProducts(query: String) {
        // Mevcut arama işlemini iptal et
        searchJob?.cancel()
        
        if (query.isEmpty()) {
            getAllProducts()
            return
        }
        
        searchJob = viewModelScope.launch {
            try {
                _state.value = _state.value.copy(isLoading = true, error = null)
                
                // Küçük bir gecikme ekle, kullanıcı yazmayı bitirebilsin
                delay(300)
                
                val products = productRepository.searchProducts(query)
                _state.value = _state.value.copy(
                    products = products,
                    isLoading = false
                )
            } catch (e: Exception) {
                _state.value = _state.value.copy(
                    error = e.message ?: "Ürünler yüklenirken bir hata oluştu",
                    isLoading = false
                )
            }
        }
    }
    
    fun filterByCategory(category: String) {
        viewModelScope.launch {
            try {
                _state.value = _state.value.copy(isLoading = true, error = null)
                
                val products = if (category == "Tümü") {
                    productRepository.getProducts()
                } else {
                    productRepository.getProductsByCategory(category)
                }
                
                _state.value = _state.value.copy(
                    products = products,
                    isLoading = false
                )
            } catch (e: Exception) {
                _state.value = _state.value.copy(
                    error = e.message ?: "Ürünler filtrelenirken bir hata oluştu",
                    isLoading = false
                )
            }
        }
    }
    
    fun filterBySubcategory(subcategory: String) {
        viewModelScope.launch {
            try {
                _state.value = _state.value.copy(isLoading = true, error = null)
                
                val products = productRepository.getProductsByCategory(subcategory)
                _state.value = _state.value.copy(
                    products = products,
                    isLoading = false
                )
            } catch (e: Exception) {
                _state.value = _state.value.copy(
                    error = e.message ?: "Alt kategori filtresi uygulanırken bir hata oluştu",
                    isLoading = false
                )
            }
        }
    }
    
    private fun getAllProducts() {
        viewModelScope.launch {
            try {
                _state.value = _state.value.copy(isLoading = true, error = null)
                
                val products = productRepository.getProducts()
                _state.value = _state.value.copy(
                    products = products,
                    isLoading = false
                )
            } catch (e: Exception) {
                _state.value = _state.value.copy(
                    error = e.message ?: "Ürünler yüklenirken bir hata oluştu",
                    isLoading = false
                )
            }
        }
    }
} 