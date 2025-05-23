package com.example.smartify.api.repository

import android.util.Log
import com.example.smartify.api.ApiService
import com.example.smartify.api.UpdateAddressRequest
import com.example.smartify.api.models.Address
import com.example.smartify.api.models.AuthResponse
import com.example.smartify.api.models.LoginRequest
import com.example.smartify.api.models.RegisterRequest
import com.example.smartify.api.models.User
import com.example.smartify.utils.NetworkResult
import com.example.smartify.utils.SessionManager
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import retrofit2.Response
import javax.inject.Inject
import javax.inject.Singleton
import com.google.gson.Gson

@Singleton
class AuthRepository @Inject constructor(
    private val apiService: ApiService,
    private val sessionManager: SessionManager
) {
    companion object {
        private const val TAG = "AuthRepository"
    }
    
    // Gson nesnesi
    private val gson = Gson()
    
    suspend fun login(email: String, password: String): NetworkResult<AuthResponse> {
        return handleResponse(
            apiService.login(LoginRequest(email, password))
        )
    }

    suspend fun register(name: String, email: String, password: String): NetworkResult<AuthResponse> {
        return handleResponse(
            apiService.register(RegisterRequest(name, email, password))
        )
    }

    suspend fun getUserProfile(): NetworkResult<User> {
        return try {
            val token = sessionManager.getToken().first()
            if (token.isNullOrEmpty()) {
                Log.w(TAG, "getUserProfile: Token bulunamadı")
                NetworkResult.Error("Oturum açık değil")
            } else {
                Log.d(TAG, "getUserProfile: Profil alınıyor. Token mevcut: ${token.take(15)}...")
                val response = apiService.getUserProfile()
                
                if (response.isSuccessful && response.body() != null) {
                    Log.d(TAG, "getUserProfile: Profil başarıyla alındı: ${response.body()?.name}")
                    val user = response.body()!!
                    
                    // Profil bilgilerini JSON olarak kaydet
                    saveUserAsJson(user)
                    
                    NetworkResult.Success(user)
                } else {
                    val errorCode = response.code()
                    val errorBody = response.errorBody()?.string()
                    
                    Log.e(TAG, "getUserProfile: Profil alınamadı. Hata kodu: $errorCode, Hata: $errorBody")
                    
                    // 404 hatası durumunda saklanan verileri kontrol et
                    if (errorCode == 404 && errorBody?.contains("Kullanıcı bulunamadı") == true) {
                        Log.w(TAG, "getUserProfile: 404 Hatası - Saklanan veriler kontrol ediliyor")
                        val cachedUser = getUserInfoFromStorage()
                        if (cachedUser != null) {
                            Log.d(TAG, "getUserProfile: Saklanan verilerden profil yüklendi: ${cachedUser.name}")
                            return NetworkResult.Success(cachedUser)
                        }
                    }
                    
                    // 401 ve 404 hatalarını özel olarak işleyelim
                    val errorMessage = when (errorCode) {
                        401 -> "Yetkilendirme hatası: Token geçersiz olabilir (401)"
                        404 -> "Profil bulunamadı: Kullanıcı kaydı bulunamadı (404)"
                        else -> errorBody ?: "Bilinmeyen hata (HTTP $errorCode)"
                    }
                    
                    NetworkResult.Error(errorMessage)
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "getUserProfile: İstek hatası", e)
            
            // Hata durumunda saklanan verileri kontrol et
            try {
                val cachedUser = getUserInfoFromStorage()
                if (cachedUser != null) {
                    Log.d(TAG, "getUserProfile: İstek hatası sonrası saklanan verilerden profil yüklendi: ${cachedUser.name}")
                    return NetworkResult.Success(cachedUser)
                }
            } catch (_: Exception) {
                // Saklanan verilerden yükleme başarısız olursa, devam et
            }
            
            NetworkResult.Error(e.message ?: "Bilinmeyen hata")
        }
    }
    
    // Kullanıcı adres bilgilerini getiren fonksiyon
    suspend fun getUserProfileAndAddress(): NetworkResult<User> {
        return try {
            val token = sessionManager.getToken().first()
            if (token.isNullOrEmpty()) {
                Log.w(TAG, "getUserProfileAndAddress: Token bulunamadı")
                NetworkResult.Error("Oturum açık değil")
            } else {
                Log.d(TAG, "getUserProfileAndAddress: Adres bilgileri alınıyor. Token mevcut: ${token.take(15)}...")
                val response = apiService.getUserProfileAndAddress()
                
                if (response.isSuccessful && response.body() != null) {
                    Log.d(TAG, "getUserProfileAndAddress: Adres bilgileri başarıyla alındı")
                    val user = response.body()!!
                    
                    // Profil bilgilerini JSON olarak kaydet
                    saveUserAsJson(user)
                    
                    NetworkResult.Success(user)
                } else {
                    val errorCode = response.code()
                    val errorBody = response.errorBody()?.string()
                    
                    Log.e(TAG, "getUserProfileAndAddress: Adres bilgileri alınamadı. Hata kodu: $errorCode, Hata: $errorBody")
                    
                    // Saklanan kullanıcı bilgilerini kontrol et
                    val cachedUser = getUserInfoFromStorage()
                    if (cachedUser != null) {
                        Log.d(TAG, "getUserProfileAndAddress: Saklanan verilerden profil yüklendi: ${cachedUser.name}")
                        return NetworkResult.Success(cachedUser)
                    }
                    
                    val errorMessage = when (errorCode) {
                        401 -> "Yetkilendirme hatası: Token geçersiz olabilir (401)"
                        404 -> "Profil bulunamadı: Kullanıcı kaydı bulunamadı (404)"
                        else -> errorBody ?: "Bilinmeyen hata (HTTP $errorCode)"
                    }
                    
                    NetworkResult.Error(errorMessage)
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "getUserProfileAndAddress: İstek hatası", e)
            
            // Hata durumunda saklanan verileri kontrol et
            try {
                val cachedUser = getUserInfoFromStorage()
                if (cachedUser != null) {
                    Log.d(TAG, "getUserProfileAndAddress: İstek hatası sonrası saklanan verilerden profil yüklendi: ${cachedUser.name}")
                    return NetworkResult.Success(cachedUser)
                }
            } catch (_: Exception) {
                // Saklanan verilerden yükleme başarısız olursa, devam et
            }
            
            NetworkResult.Error(e.message ?: "Bilinmeyen hata")
        }
    }
    
    // Kullanıcı adres bilgilerini güncelleyen fonksiyon
    suspend fun updateUserAddress(address: Address): NetworkResult<User> {
        return try {
            val token = sessionManager.getToken().first()
            if (token.isNullOrEmpty()) {
                Log.w(TAG, "updateUserAddress: Token bulunamadı")
                NetworkResult.Error("Oturum açık değil")
            } else {
                Log.d(TAG, "updateUserAddress: Adres bilgileri güncelleniyor. Token mevcut: ${token.take(15)}...")
                val response = apiService.updateUserAddress(UpdateAddressRequest(address))
                
                if (response.isSuccessful && response.body() != null) {
                    Log.d(TAG, "updateUserAddress: Adres bilgileri başarıyla güncellendi")
                    val user = response.body()!!
                    
                    // Güncellenmiş profil bilgilerini JSON olarak kaydet
                    saveUserAsJson(user)
                    
                    NetworkResult.Success(user)
                } else {
                    val errorCode = response.code()
                    val errorBody = response.errorBody()?.string()
                    
                    Log.e(TAG, "updateUserAddress: Adres güncellenemedi. Hata kodu: $errorCode, Hata: $errorBody")
                    
                    val errorMessage = when (errorCode) {
                        401 -> "Yetkilendirme hatası: Token geçersiz olabilir (401)"
                        404 -> "Profil bulunamadı: Kullanıcı kaydı bulunamadı (404)"
                        else -> errorBody ?: "Bilinmeyen hata (HTTP $errorCode)"
                    }
                    
                    NetworkResult.Error(errorMessage)
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "updateUserAddress: İstek hatası", e)
            NetworkResult.Error(e.message ?: "Bilinmeyen hata")
        }
    }

    suspend fun updateUserProfile(user: User): NetworkResult<User> {
        return try {
            val token = sessionManager.getToken().first()
            if (token.isNullOrEmpty()) {
                NetworkResult.Error("Oturum açık değil")
            } else {
                val response = apiService.updateUserProfile(user)
                if (response.isSuccessful && response.body() != null) {
                    val updatedUser = response.body()!!
                    
                    // Güncellenmiş profil bilgilerini JSON olarak kaydet
                    saveUserAsJson(updatedUser)
                    
                    NetworkResult.Success(updatedUser)
                } else {
                    NetworkResult.Error(response.errorBody()?.string() ?: "Bilinmeyen hata")
                }
            }
        } catch (e: Exception) {
            NetworkResult.Error(e.message ?: "Bilinmeyen hata")
        }
    }

    fun isLoggedIn(): Flow<String?> {
        return sessionManager.getToken()
    }

    suspend fun saveAuthData(authResponse: AuthResponse) {
        Log.d(TAG, "Token kaydediliyor: ${authResponse.token.take(15)}...")
        sessionManager.saveToken(authResponse.token)
        sessionManager.saveUserId(authResponse.user.id)
        
        // Kullanıcı bilgilerini kaydet
        sessionManager.saveUserInfo(authResponse.user.name, authResponse.user.email)
        
        // Kullanıcı bilgilerini JSON olarak kaydet
        saveUserAsJson(authResponse.user)
    }

    // Kullanıcı bilgilerini JSON olarak kaydet
    private suspend fun saveUserAsJson(user: User) {
        try {
            val userJson = gson.toJson(user)
            Log.d(TAG, "Kullanıcı JSON olarak kaydediliyor (${userJson.length} karakter)")
            sessionManager.saveUserInfoAsJson(userJson)
            Log.d(TAG, "Kullanıcı JSON olarak başarıyla kaydedildi")
        } catch (e: Exception) {
            Log.e(TAG, "Kullanıcı JSON olarak kaydedilemedi: ${e.message}", e)
        }
    }
    
    // JSON olarak kaydedilmiş kullanıcı bilgilerini al
    suspend fun getUserInfoFromStorage(): User? {
        try {
            // Önce JSON'dan almaya çalış
            val userJson = sessionManager.getUserJson().first()
            if (!userJson.isNullOrEmpty()) {
                val user = gson.fromJson(userJson, User::class.java)
                Log.d(TAG, "JSON'dan kullanıcı bilgisi çözümlendi: ${user.name} (${user.email})")
                return user
            }
            
            // JSON bulunamazsa, temel bilgileri al
            val name = sessionManager.getUserName().first()
            val email = sessionManager.getUserEmail().first()
            val userId = sessionManager.getUserId().first()
            
            return if (!name.isNullOrEmpty() && !email.isNullOrEmpty()) {
                Log.d(TAG, "Temel kullanıcı bilgileri bulundu: $name ($email)")
                User(
                    id = userId ?: "unknown_id",
                    name = name,
                    email = email,
                    createdAt = "",
                    updatedAt = null
                )
            } else {
                Log.w(TAG, "Saklanan kullanıcı bilgisi bulunamadı")
                null
            }
        } catch (e: Exception) {
            Log.e(TAG, "Saklanan kullanıcı bilgisi alınırken hata: ${e.message}", e)
            return null
        }
    }

    suspend fun logout() {
        Log.d(TAG, "logout: Oturum sonlandırılıyor")
        sessionManager.clearSession()
    }

    private fun <T> handleResponse(response: Response<T>): NetworkResult<T> {
        return try {
            if (response.isSuccessful) {
                val body = response.body()
                if (body != null) {
                    NetworkResult.Success(body)
                } else {
                    NetworkResult.Error("Boş yanıt alındı")
                }
            } else {
                val errorBody = response.errorBody()?.string()
                NetworkResult.Error(errorBody ?: "Bilinmeyen hata")
            }
        } catch (e: Exception) {
            NetworkResult.Error(e.message ?: "Bilinmeyen hata")
        }
    }
} 