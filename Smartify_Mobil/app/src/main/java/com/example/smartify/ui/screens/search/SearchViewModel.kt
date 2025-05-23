package com.example.smartify.ui.screens.search

import android.util.Log
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
                
                try {
                    // İlk önce özel arama API'sini dene
                    val products = productRepository.searchProducts(query)
                    _state.value = _state.value.copy(
                        products = products,
                        isLoading = false
                    )
                } catch (e: Exception) {
                    // Arama API'si başarısız olursa, tüm ürünleri al ve istemci tarafında filtrele
                    Log.w("SearchViewModel", "Arama API'si başarısız oldu, tüm ürünler yerel olarak filtreleniyor", e)
                    
                    try {
                        val allProducts = productRepository.getProducts()
                        // İstemci tarafında arama yap
                        val filteredProducts = allProducts.filter { product ->
                            product.name.contains(query, ignoreCase = true) ||
                            product.description.contains(query, ignoreCase = true) ||
                            product.category.contains(query, ignoreCase = true) ||
                            (product.mainCategory?.contains(query, ignoreCase = true) ?: false)
                        }
                        
                        _state.value = _state.value.copy(
                            products = filteredProducts,
                            isLoading = false,
                            error = if (filteredProducts.isEmpty()) "Aramanıza uygun ürün bulunamadı" else null
                        )
                    } catch (fallbackException: Exception) {
                        _state.value = _state.value.copy(
                            error = "Arama yapılamıyor: ${fallbackException.message}",
                            isLoading = false
                        )
                    }
                }
            } catch (e: Exception) {
                _state.value = _state.value.copy(
                    error = e.message ?: "Ürünler yüklenirken bir hata oluştu",
                    isLoading = false
                )
            }
        }
    }
    
    fun filterByCategory(category: String) {
        Log.d("SearchViewModel", "Kategori filtresi başlatıldı: $category")
        viewModelScope.launch {
            try {
                _state.value = _state.value.copy(isLoading = true, error = null)
                Log.d("SearchViewModel", "Yükleniyor durumu ayarlandı")
                
                val products = if (category == "Tümü") {
                    Log.d("SearchViewModel", "Tüm ürünler getiriliyor")
                    productRepository.getProducts()
                } else {
                    try {
                        Log.d("SearchViewModel", "Kategori ürünleri getiriliyor: $category")
                        productRepository.getProductsByCategory(category)
                    } catch (e: Exception) {
                        Log.e("SearchViewModel", "Kategori ürünleri getirilirken hata: ${e.message}")
                        _state.value = _state.value.copy(
                            error = "Bu kategoride ürün bulunamadı: $category",
                            isLoading = false,
                            products = emptyList()
                        )
                        return@launch
                    }
                }
                
                if (products.isEmpty()) {
                    Log.w("SearchViewModel", "Ürün bulunamadı: $category")
                    _state.value = _state.value.copy(
                        error = "Bu kategoride ürün bulunamadı: $category",
                        isLoading = false,
                        products = emptyList()
                    )
                } else {
                    Log.d("SearchViewModel", "Ürünler başarıyla getirildi. Ürün sayısı: ${products.size}")
                    _state.value = _state.value.copy(
                        products = products,
                        isLoading = false,
                        error = null
                    )
                }
            } catch (e: Exception) {
                Log.e("SearchViewModel", "Kategori filtreleme hatası: ${e.message}")
                _state.value = _state.value.copy(
                    error = "Kategori filtrelenirken bir hata oluştu: ${e.message}",
                    isLoading = false,
                    products = emptyList()
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