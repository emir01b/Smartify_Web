package com.example.smartify.data.repository

import com.example.smartify.api.ApiService
import com.example.smartify.api.models.AuthResponse
import com.example.smartify.api.models.LoginRequest
import com.example.smartify.api.models.RegisterRequest
import com.example.smartify.api.models.User
import com.example.smartify.utils.NetworkResult
import com.example.smartify.utils.SessionManager
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import retrofit2.HttpException
import java.io.IOException
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AuthRepository @Inject constructor(
    private val apiService: ApiService,
    private val sessionManager: SessionManager
) {
    // Giriş işlemi
    suspend fun login(email: String, password: String): NetworkResult<AuthResponse> {
        return try {
            val response = apiService.login(LoginRequest(email, password))
            
            if (response.isSuccessful && response.body()?.success == true) {
                val authResponse = response.body()
                
                // Token ve userId kaydet
                authResponse?.let {
                    sessionManager.saveToken(it.token)
                    sessionManager.saveUserId(it.user.id)
                }
                
                NetworkResult.Success(authResponse!!)
            } else {
                NetworkResult.Error(response.body()?.message ?: "Giriş yapılırken bir hata oluştu")
            }
        } catch (e: IOException) {
            NetworkResult.Error("İnternet bağlantınızı kontrol edin")
        } catch (e: HttpException) {
            NetworkResult.Error("Sunucu hatası: ${e.message}")
        } catch (e: Exception) {
            NetworkResult.Error("Bilinmeyen bir hata oluştu: ${e.message}")
        }
    }
    
    // Kayıt işlemi
    suspend fun register(name: String, email: String, password: String, phone: String? = null): NetworkResult<AuthResponse> {
        return try {
            val response = apiService.register(RegisterRequest(name, email, password, phone))
            
            if (response.isSuccessful && response.body()?.success == true) {
                val authResponse = response.body()
                
                // Token ve userId kaydet
                authResponse?.let {
                    sessionManager.saveToken(it.token)
                    sessionManager.saveUserId(it.user.id)
                }
                
                NetworkResult.Success(authResponse!!)
            } else {
                NetworkResult.Error(response.body()?.message ?: "Kayıt olunurken bir hata oluştu")
            }
        } catch (e: IOException) {
            NetworkResult.Error("İnternet bağlantınızı kontrol edin")
        } catch (e: HttpException) {
            NetworkResult.Error("Sunucu hatası: ${e.message}")
        } catch (e: Exception) {
            NetworkResult.Error("Bilinmeyen bir hata oluştu: ${e.message}")
        }
    }
    
    // Kullanıcı profili getir
    suspend fun getUserProfile(): NetworkResult<User> {
        return try {
            val response = apiService.getUserProfile()
            
            if (response.isSuccessful && response.body()?.success == true) {
                val user = response.body()?.data
                
                if (user != null) {
                    NetworkResult.Success(user)
                } else {
                    NetworkResult.Error("Kullanıcı profili bulunamadı")
                }
            } else {
                NetworkResult.Error(response.body()?.message ?: "Kullanıcı profili getirilirken bir hata oluştu")
            }
        } catch (e: IOException) {
            NetworkResult.Error("İnternet bağlantınızı kontrol edin")
        } catch (e: HttpException) {
            NetworkResult.Error("Sunucu hatası: ${e.message}")
        } catch (e: Exception) {
            NetworkResult.Error("Bilinmeyen bir hata oluştu: ${e.message}")
        }
    }
    
    // Kullanıcı profili güncelle
    suspend fun updateUserProfile(user: User): NetworkResult<User> {
        return try {
            val response = apiService.updateUserProfile(user)
            
            if (response.isSuccessful && response.body()?.success == true) {
                val updatedUser = response.body()?.data
                
                if (updatedUser != null) {
                    NetworkResult.Success(updatedUser)
                } else {
                    NetworkResult.Error("Kullanıcı profili güncellenirken bir hata oluştu")
                }
            } else {
                NetworkResult.Error(response.body()?.message ?: "Kullanıcı profili güncellenirken bir hata oluştu")
            }
        } catch (e: IOException) {
            NetworkResult.Error("İnternet bağlantınızı kontrol edin")
        } catch (e: HttpException) {
            NetworkResult.Error("Sunucu hatası: ${e.message}")
        } catch (e: Exception) {
            NetworkResult.Error("Bilinmeyen bir hata oluştu: ${e.message}")
        }
    }
    
    // Oturumu kapat
    suspend fun logout() {
        sessionManager.clearSession()
    }
    
    // Kullanıcının oturum açıp açmadığını kontrol et
    fun isUserLoggedIn(): Flow<Boolean> {
        return sessionManager.getToken().map { token ->
            !token.isNullOrEmpty()
        }
    }
} 