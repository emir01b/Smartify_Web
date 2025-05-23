package com.example.smartify.data.repository

import android.util.Log
import com.example.smartify.api.ApiService
import com.example.smartify.api.models.Product
import com.example.smartify.utils.NetworkResult
import com.example.smartify.utils.SessionManager
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import retrofit2.HttpException
import java.io.IOException
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class FavoritesRepository @Inject constructor(
    private val apiService: ApiService,
    private val sessionManager: SessionManager
) {
    companion object {
        private const val TAG = "FavoritesRepository"
    }
    
    // Kullanıcının favorilerini getir
    suspend fun getFavorites(): Flow<NetworkResult<List<Product>>> = flow {
        emit(NetworkResult.Loading)
        
        try {
            Log.d(TAG, "Favoriler getiriliyor")
            val response = apiService.getFavorites()
            
            if (response.isSuccessful) {
                val favorites = response.body()
                if (favorites != null) {
                    Log.d(TAG, "Favoriler başarıyla alındı: ${favorites.size} ürün")
                    emit(NetworkResult.Success(favorites))
                } else {
                    Log.e(TAG, "Favoriler boş döndü")
                    emit(NetworkResult.Error("Favoriler getirilirken bir hata oluştu: Boş yanıt"))
                }
            } else {
                val errorBody = response.errorBody()?.string()
                Log.e(TAG, "Favoriler alınamadı. HTTP ${response.code()}: ${response.message()}, Error: $errorBody")
                emit(NetworkResult.Error("Favoriler getirilirken bir hata oluştu: ${response.code()} ${response.message()}"))
            }
        } catch (e: IOException) {
            Log.e(TAG, "İnternet bağlantı hatası: ${e.message}", e)
            emit(NetworkResult.Error("İnternet bağlantınızı kontrol edin"))
        } catch (e: HttpException) {
            Log.e(TAG, "HTTP İstisna: ${e.code()} - ${e.message()}", e)
            emit(NetworkResult.Error("Sunucu hatası: ${e.message}"))
        } catch (e: Exception) {
            Log.e(TAG, "Beklenmeyen hata: ${e.message}", e)
            emit(NetworkResult.Error("Bilinmeyen bir hata oluştu: ${e.message}"))
        }
    }
    
    // Favorilere ürün ekle
    suspend fun addToFavorites(productId: String): NetworkResult<String> {
        return try {
            Log.d(TAG, "Ürün favorilere ekleniyor: $productId")
            val response = apiService.addToFavorites(productId)
            
            if (response.isSuccessful) {
                val favoriteResponse = response.body()
                if (favoriteResponse != null) {
                    Log.d(TAG, "Ürün favorilere eklendi: ${favoriteResponse.message}")
                    NetworkResult.Success("Ürün favorilere eklendi")
                } else {
                    Log.e(TAG, "Favorilere eklerken yanıt boş")
                    NetworkResult.Error("Favorilere eklerken bir hata oluştu: Boş yanıt")
                }
            } else {
                val errorBody = response.errorBody()?.string()
                Log.e(TAG, "Favorilere eklenemedi. HTTP ${response.code()}: ${response.message()}, Error: $errorBody")
                NetworkResult.Error("Favorilere eklerken bir hata oluştu: ${response.code()} ${response.message()}")
            }
        } catch (e: IOException) {
            Log.e(TAG, "İnternet bağlantı hatası: ${e.message}", e)
            NetworkResult.Error("İnternet bağlantınızı kontrol edin")
        } catch (e: HttpException) {
            Log.e(TAG, "HTTP İstisna: ${e.code()} - ${e.message()}", e)
            NetworkResult.Error("Sunucu hatası: ${e.message}")
        } catch (e: Exception) {
            Log.e(TAG, "Beklenmeyen hata: ${e.message}", e)
            NetworkResult.Error("Bilinmeyen bir hata oluştu: ${e.message}")
        }
    }
    
    // Favorilerden ürün çıkar
    suspend fun removeFromFavorites(productId: String): NetworkResult<String> {
        return try {
            Log.d(TAG, "Ürün favorilerden çıkarılıyor: $productId")
            val response = apiService.removeFromFavorites(productId)
            
            if (response.isSuccessful) {
                val favoriteResponse = response.body()
                if (favoriteResponse != null) {
                    Log.d(TAG, "Ürün favorilerden çıkarıldı: ${favoriteResponse.message}")
                    NetworkResult.Success("Ürün favorilerden çıkarıldı")
                } else {
                    Log.e(TAG, "Favorilerden çıkarırken yanıt boş")
                    NetworkResult.Error("Favorilerden çıkarırken bir hata oluştu: Boş yanıt")
                }
            } else {
                val errorBody = response.errorBody()?.string()
                Log.e(TAG, "Favorilerden çıkarılamadı. HTTP ${response.code()}: ${response.message()}, Error: $errorBody")
                NetworkResult.Error("Favorilerden çıkarırken bir hata oluştu: ${response.code()} ${response.message()}")
            }
        } catch (e: IOException) {
            Log.e(TAG, "İnternet bağlantı hatası: ${e.message}", e)
            NetworkResult.Error("İnternet bağlantınızı kontrol edin")
        } catch (e: HttpException) {
            Log.e(TAG, "HTTP İstisna: ${e.code()} - ${e.message()}", e)
            NetworkResult.Error("Sunucu hatası: ${e.message}")
        } catch (e: Exception) {
            Log.e(TAG, "Beklenmeyen hata: ${e.message}", e)
            NetworkResult.Error("Bilinmeyen bir hata oluştu: ${e.message}")
        }
    }
    
    // Ürünün favori olup olmadığını kontrol et
    suspend fun isProductInFavorites(productId: String): Flow<Boolean> = flow {
        try {
            val response = apiService.getFavorites()
            
            if (response.isSuccessful) {
                val favorites = response.body()
                if (favorites != null) {
                    val isFavorite = favorites.any { it.id == productId }
                    emit(isFavorite)
                } else {
                    emit(false)
                }
            } else {
                emit(false)
            }
        } catch (e: Exception) {
            Log.e(TAG, "Favorilerde olup olmadığı kontrol edilemedi: ${e.message}", e)
            emit(false)
        }
    }
} 