package com.example.smartify.data.repository

import com.example.smartify.api.ApiService
import com.example.smartify.api.models.AuthResponse
import com.example.smartify.api.models.LoginRequest
import com.example.smartify.api.models.RegisterRequest
import com.example.smartify.api.models.User
import com.example.smartify.utils.NetworkResult
import com.example.smartify.utils.SessionManager
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import retrofit2.HttpException
import java.io.IOException
import javax.inject.Inject
import javax.inject.Singleton
import android.util.Log
import com.google.gson.Gson
import kotlinx.coroutines.launch

@Singleton
class AuthRepository @Inject constructor(
    private val apiService: ApiService,
    private val sessionManager: SessionManager
) {
    // Gson nesnesi oluştur
    private val gson = Gson()
    
    // Giriş işlemi
    suspend fun login(email: String, password: String): NetworkResult<AuthResponse> {
        return try {
            val response = apiService.login(LoginRequest(email, password))
            
            if (response.isSuccessful && response.body() != null) {
                val authResponse = response.body()
                
                // Token ve userId kaydet
                authResponse?.let {
                    sessionManager.saveToken(it.token)
                    sessionManager.saveUserId(it.user.id)
                    
                    // Kullanıcı bilgilerini JSON olarak kaydet
                    saveUserAsJson(it.user)
                }
                
                NetworkResult.Success(authResponse!!)
            } else {
                NetworkResult.Error(response.errorBody()?.string() ?: "Giriş yapılırken bir hata oluştu")
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
            
            if (response.isSuccessful && response.body() != null) {
                val authResponse = response.body()
                
                // Token ve userId kaydet
                authResponse?.let {
                    sessionManager.saveToken(it.token)
                    sessionManager.saveUserId(it.user.id)
                    
                    // Kullanıcı bilgilerini JSON olarak kaydet
                    saveUserAsJson(it.user)
                }
                
                NetworkResult.Success(authResponse!!)
            } else {
                NetworkResult.Error(response.errorBody()?.string() ?: "Kayıt olunurken bir hata oluştu")
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
            val token = sessionManager.getToken().first()
            if (token.isNullOrEmpty()) {
                return NetworkResult.Error("Oturum açık değil")
            }
            
            val response = apiService.getUserProfile()
            
            if (response.isSuccessful && response.body() != null) {
                val user = response.body()
                
                // Başarılı API yanıtını JSON olarak kaydet
                saveUserAsJson(user!!)
                
                NetworkResult.Success(user)
            } else {
                // API hatası durumunda saklanan JSON verisini kontrol et
                if (response.code() == 404 && response.errorBody()?.string()?.contains("Kullanıcı bulunamadı") == true) {
                    Log.w("AuthRepository", "API'den kullanıcı bulunamadı. Saklanan veriler kontrol ediliyor.")
                    val cachedUser = getUserFromJson()
                    if (cachedUser != null) {
                        Log.d("AuthRepository", "JSON'dan kullanıcı bilgisi yüklendi: ${cachedUser.name}")
                        return NetworkResult.Success(cachedUser)
                    }
                }
                NetworkResult.Error(response.errorBody()?.string() ?: "Kullanıcı profili getirilirken bir hata oluştu")
            }
        } catch (e: IOException) {
            // Ağ hatası durumunda saklanan kullanıcı bilgilerini kontrol et
            Log.w("AuthRepository", "Ağ hatası: ${e.message}. Saklanan veriler kontrol ediliyor.")
            val cachedUser = getUserFromJson()
            if (cachedUser != null) {
                Log.d("AuthRepository", "JSON'dan kullanıcı bilgisi yüklendi (ağ hatası): ${cachedUser.name}")
                return NetworkResult.Success(cachedUser)
            }
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
            val token = sessionManager.getToken().first()
            if (token.isNullOrEmpty()) {
                return NetworkResult.Error("Oturum açık değil")
            }
            
            val response = apiService.updateUserProfile(user)
            
            if (response.isSuccessful && response.body() != null) {
                val updatedUser = response.body()
                
                // Güncellenmiş kullanıcı bilgilerini JSON olarak kaydet
                saveUserAsJson(updatedUser!!)
                
                NetworkResult.Success(updatedUser)
            } else {
                NetworkResult.Error(response.errorBody()?.string() ?: "Kullanıcı profili güncellenirken bir hata oluştu")
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
            val isLoggedIn = !token.isNullOrEmpty()
            val firstChars = if (!token.isNullOrEmpty()) token.take(15) + "..." else "null"
            Log.d("AuthRepository", "isUserLoggedIn kontrolü: $isLoggedIn (Token: $firstChars)")
            isLoggedIn
        }
    }
    
    // API repository sınıfı ile uyumlu olması için eklendi
    fun isLoggedIn(): Flow<String?> {
        Log.d("AuthRepository", "isLoggedIn metodu çağrıldı")
        return sessionManager.getToken()
    }
    
    // API repository sınıfı ile uyumlu olması için eklendi
    suspend fun saveAuthData(authResponse: AuthResponse) {
        Log.d("AuthRepository", "saveAuthData: ${authResponse.user.name} (${authResponse.user.email})")
        Log.d("AuthRepository", "saveAuthData token: ${authResponse.token.take(15)}... (${authResponse.token.length} karakter)")
        
        // Token ve kullanıcı ID'sini kaydet
        sessionManager.saveToken(authResponse.token)
        sessionManager.saveUserId(authResponse.user.id)
        
        // Kullanıcı bilgilerini de kaydet (API'den yüklenemediğinde kullanmak için)
        saveUserInfoDirectly(authResponse.user)
        
        // Kullanıcı bilgilerini JSON olarak da kaydet
        saveUserAsJson(authResponse.user)
    }
    
    // Kullanıcı bilgilerini doğrudan kaydet (API'de sorun olduğunda kullanmak için)
    private suspend fun saveUserInfoDirectly(user: User) {
        Log.d("AuthRepository", "Kullanıcı bilgileri kaydediliyor: ${user.name} (${user.email})")
        try {
            sessionManager.saveUserInfo(user.name, user.email)
            Log.d("AuthRepository", "Kullanıcı bilgileri başarıyla kaydedildi")
        } catch (e: Exception) {
            Log.e("AuthRepository", "Kullanıcı bilgileri kaydedilemedi: ${e.message}", e)
        }
    }
    
    // Kullanıcı bilgilerini JSON olarak kaydet
    private suspend fun saveUserAsJson(user: User) {
        try {
            val userJson = gson.toJson(user)
            Log.d("AuthRepository", "Kullanıcı JSON olarak kaydediliyor (${userJson.length} karakter)")
            sessionManager.saveUserInfoAsJson(userJson)
            Log.d("AuthRepository", "Kullanıcı JSON olarak başarıyla kaydedildi")
        } catch (e: Exception) {
            Log.e("AuthRepository", "Kullanıcı JSON olarak kaydedilemedi: ${e.message}", e)
        }
    }
    
    // JSON'dan kullanıcı bilgisi getir
    private suspend fun getUserFromJson(): User? {
        return try {
            val userJson = sessionManager.getUserJson().first()
            if (!userJson.isNullOrEmpty()) {
                val user = gson.fromJson(userJson, User::class.java)
                Log.d("AuthRepository", "JSON'dan kullanıcı bilgisi çözümlendi: ${user.name} (${user.email})")
                user
            } else {
                Log.w("AuthRepository", "Kaydedilmiş JSON kullanıcı bilgisi bulunamadı")
                null
            }
        } catch (e: Exception) {
            Log.e("AuthRepository", "JSON'dan kullanıcı bilgisi çözümlenirken hata: ${e.message}", e)
            null
        }
    }
    
    // Kullanıcı bilgilerini doğrudan belleğe kaydedelim - TokenInterceptor başarısız olduğunda kullanmak için
    suspend fun getUserInfoFromStorage(): User? {
        // Önce JSON'dan kullanıcı bilgilerini almaya çalış
        val jsonUser = getUserFromJson()
        if (jsonUser != null) {
            Log.d("AuthRepository", "JSON'dan kullanıcı bilgileri alındı: ${jsonUser.name}")
            return jsonUser
        }
        
        // JSON'dan alınamazsa basic bilgileri kullan
        val name = sessionManager.getUserName().first()
        val email = sessionManager.getUserEmail().first()
        val userId = sessionManager.getUserId().first()
        
        return if (!name.isNullOrEmpty() && !email.isNullOrEmpty()) {
            Log.d("AuthRepository", "Kaydedilmiş kullanıcı bilgileri bulundu: $name ($email)")
            User(
                id = userId ?: "unknown_id",
                name = name,
                email = email,
                createdAt = "",
                updatedAt = null
            )
        } else {
            Log.d("AuthRepository", "Kaydedilmiş kullanıcı bilgisi bulunamadı")
            null
        }
    }
} 