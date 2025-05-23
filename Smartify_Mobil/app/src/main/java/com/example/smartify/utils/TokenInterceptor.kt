package com.example.smartify.utils

import android.content.Context
import android.util.Log
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.runBlocking
import okhttp3.Interceptor
import okhttp3.Request
import okhttp3.Response
import javax.inject.Inject
import javax.inject.Singleton

val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = Constants.DATASTORE_NAME)

@Singleton
class TokenInterceptor @Inject constructor(
    private val sessionManager: SessionManager
) : Interceptor {
    
    companion object {
        private const val TAG = "TokenInterceptor"
    }
    
    override fun intercept(chain: Interceptor.Chain): Response {
        val originalRequest = chain.request()
        
        try {
            val path = originalRequest.url.encodedPath
            val method = originalRequest.method
            Log.d(TAG, "[$method] URL: ${originalRequest.url}, Path: $path")
            
            // Token alınması gereken istekler için (login ve register hariç)
            if (!path.contains("/api/auth/login") && !path.contains("/api/auth/register")) {
                
                val token = runBlocking { 
                    sessionManager.getToken().first() 
                }
                
                Log.d(TAG, "Token mevcut mu: ${!token.isNullOrEmpty()}")
                
                if (!token.isNullOrEmpty()) {
                    val newRequest = originalRequest.newBuilder()
                        .header("Authorization", "Bearer $token")
                        .build()
                    
                    Log.d(TAG, "Authorization başlığı eklendi: Bearer ${token.take(15)}...")
                    logRequestDetails(newRequest)
                    
                    val response = chain.proceed(newRequest)
                    logResponseDetails(response)
                    
                    // Eğer 401 veya 403 hata kodu dönerse, token geçersiz olabilir
                    if (response.code == 401 || response.code == 403) {
                        Log.w(TAG, "Yetkilendirme hatası (${response.code}). Yanıtı kontrol ediyorum.")
                        
                        val responseBody = response.peekBody(2048).string()
                        
                        // Sadece kullanıcı bulunamadı hatası değilse oturumu temizle
                        if (!responseBody.contains("Kullanıcı bulunamadı") && response.code != 404) {
                            Log.w(TAG, "Token geçersiz, oturum temizleniyor. Yanıt: $responseBody")
                            runBlocking {
                                try {
                                    sessionManager.clearSession()
                                    Log.d(TAG, "Oturum başarıyla temizlendi")
                                } catch (e: Exception) {
                                    Log.e(TAG, "Oturum temizlenirken hata oluştu: ${e.message}", e)
                                }
                            }
                        } else {
                            Log.w(TAG, "Kullanıcı bulunamadı hatası, oturum korunuyor (API hatası)")
                        }
                    }
                    
                    return response
                } else {
                    Log.w(TAG, "Token bulunamadı, orijinal istek gönderiliyor")
                }
            } else {
                Log.d(TAG, "Auth gerektirmeyen endpoint: $path")
            }
            
            logRequestDetails(originalRequest)
            val response = chain.proceed(originalRequest)
            logResponseDetails(response)
            
            return response
        } catch (e: Exception) {
            // Hata durumunda orijinal isteği devam ettir ve hatayı logla
            Log.e(TAG, "Interceptor hatası: ${e.message}", e)
            return chain.proceed(originalRequest)
        }
    }
    
    private fun logRequestDetails(request: Request) {
        Log.d(TAG, "İstek detayları:")
        Log.d(TAG, "URL: ${request.url}")
        Log.d(TAG, "Method: ${request.method}")
        Log.d(TAG, "Headers: ${request.headers}")
        request.body?.let { 
            Log.d(TAG, "Body: ${it.contentType()}")
        }
    }
    
    private fun logResponseDetails(response: Response) {
        Log.d(TAG, "Yanıt detayları:")
        Log.d(TAG, "Code: ${response.code}")
        Log.d(TAG, "Message: ${response.message}")
        Log.d(TAG, "Headers: ${response.headers}")
        Log.d(TAG, "İsSuccessful: ${response.isSuccessful}")
    }
}

@Singleton
class SessionManager @Inject constructor(@ApplicationContext context: Context) {
    
    private val dataStore = context.dataStore
    
    companion object {
        private const val TAG = "SessionManager"
        val TOKEN_KEY = stringPreferencesKey(Constants.KEY_TOKEN)
        val USER_ID_KEY = stringPreferencesKey(Constants.KEY_USER_ID)
        val USER_NAME_KEY = stringPreferencesKey(Constants.KEY_USER_NAME)
        val USER_EMAIL_KEY = stringPreferencesKey(Constants.KEY_USER_EMAIL)
        val USER_JSON_KEY = stringPreferencesKey(Constants.KEY_USER_JSON)
    }
    
    suspend fun saveToken(token: String) {
        Log.d(TAG, "Token kaydediliyor: ${token.take(15)}...")
        try {
            dataStore.edit { preferences ->
                preferences[TOKEN_KEY] = token
            }
            Log.d(TAG, "Token başarıyla kaydedildi (${token.length} karakter)")
        } catch (e: Exception) {
            Log.e(TAG, "Token kaydedilirken hata: ${e.message}", e)
        }
    }
    
    suspend fun saveUserId(userId: String) {
        Log.d(TAG, "UserId kaydediliyor: $userId")
        try {
            dataStore.edit { preferences ->
                preferences[USER_ID_KEY] = userId
            }
            Log.d(TAG, "UserId başarıyla kaydedildi")
        } catch (e: Exception) {
            Log.e(TAG, "UserId kaydedilirken hata: ${e.message}", e)
        }
    }
    
    suspend fun saveUserInfo(name: String, email: String) {
        Log.d(TAG, "Kullanıcı bilgileri kaydediliyor: $name ($email)")
        try {
            dataStore.edit { preferences ->
                preferences[USER_NAME_KEY] = name
                preferences[USER_EMAIL_KEY] = email
            }
            Log.d(TAG, "Kullanıcı bilgileri başarıyla kaydedildi")
        } catch (e: Exception) {
            Log.e(TAG, "Kullanıcı bilgileri kaydedilemedi: ${e.message}", e)
        }
    }
    
    // Kullanıcı bilgilerini JSON olarak kaydet (daha fazla veri için)
    suspend fun saveUserInfoAsJson(userJson: String) {
        Log.d(TAG, "Kullanıcı bilgileri JSON olarak kaydediliyor")
        try {
            dataStore.edit { preferences ->
                preferences[USER_JSON_KEY] = userJson
            }
            Log.d(TAG, "Kullanıcı JSON bilgileri başarıyla kaydedildi")
        } catch (e: Exception) {
            Log.e(TAG, "Kullanıcı JSON bilgileri kaydedilemedi: ${e.message}", e)
        }
    }
    
    // Kullanıcı JSON verilerini al
    fun getUserJson() = dataStore.data.map { preferences ->
        val userJson = preferences[USER_JSON_KEY]
        Log.d(TAG, "Kullanıcı JSON bilgileri alındı: ${userJson?.take(50)}...")
        userJson
    }
    
    fun getToken() = dataStore.data.map { preferences ->
        try {
            val token = preferences[TOKEN_KEY]
            if (token != null) {
                Log.d(TAG, "Token alındı: ${token.take(15)}... (${token.length} karakter)")
            } else {
                Log.w(TAG, "Kaydedilmiş token bulunamadı (null)")
            }
            token
        } catch (e: Exception) {
            Log.e(TAG, "Token alınırken hata: ${e.message}", e)
            null
        }
    }
    
    fun getUserId() = dataStore.data.map { preferences ->
        val userId = preferences[USER_ID_KEY]
        Log.d(TAG, "UserId alındı: $userId")
        userId
    }
    
    fun getUserName() = dataStore.data.map { preferences ->
        val name = preferences[USER_NAME_KEY]
        Log.d(TAG, "Kullanıcı adı alındı: $name")
        name
    }
    
    fun getUserEmail() = dataStore.data.map { preferences ->
        val email = preferences[USER_EMAIL_KEY]
        Log.d(TAG, "Kullanıcı e-postası alındı: $email")
        email
    }
    
    suspend fun clearSession() {
        Log.d(TAG, "Oturum temizleniyor")
        try {
            dataStore.edit { preferences ->
                preferences.clear()
            }
            Log.d(TAG, "Oturum verileri başarıyla temizlendi")
        } catch (e: Exception) {
            Log.e(TAG, "Oturum verileri temizlenirken hata: ${e.message}", e)
            throw e
        }
    }
} 