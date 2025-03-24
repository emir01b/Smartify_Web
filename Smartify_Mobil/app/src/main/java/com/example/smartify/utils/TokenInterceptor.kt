package com.example.smartify.utils

import android.content.Context
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
import okhttp3.Response
import javax.inject.Inject
import javax.inject.Singleton

val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = Constants.DATASTORE_NAME)

@Singleton
class TokenInterceptor @Inject constructor() : Interceptor {
    
    @Inject
    lateinit var sessionManager: SessionManager
    
    override fun intercept(chain: Interceptor.Chain): Response {
        val originalRequest = chain.request()
        
        // Token alınması gereken istekler için (login ve register hariç)
        if (!originalRequest.url.pathSegments.contains("login") && 
            !originalRequest.url.pathSegments.contains("register")) {
            
            val token = runBlocking { 
                sessionManager.getToken().first() 
            }
            
            if (!token.isNullOrEmpty()) {
                val newRequest = originalRequest.newBuilder()
                    .header("Authorization", "Bearer $token")
                    .build()
                return chain.proceed(newRequest)
            }
        }
        
        return chain.proceed(originalRequest)
    }
}

@Singleton
class SessionManager @Inject constructor(@ApplicationContext context: Context) {
    
    private val dataStore = context.dataStore
    
    companion object {
        val TOKEN_KEY = stringPreferencesKey(Constants.KEY_TOKEN)
        val USER_ID_KEY = stringPreferencesKey(Constants.KEY_USER_ID)
    }
    
    suspend fun saveToken(token: String) {
        dataStore.edit { preferences ->
            preferences[TOKEN_KEY] = token
        }
    }
    
    suspend fun saveUserId(userId: String) {
        dataStore.edit { preferences ->
            preferences[USER_ID_KEY] = userId
        }
    }
    
    fun getToken() = dataStore.data.map { preferences ->
        preferences[TOKEN_KEY]
    }
    
    fun getUserId() = dataStore.data.map { preferences ->
        preferences[USER_ID_KEY]
    }
    
    suspend fun clearSession() {
        dataStore.edit { preferences ->
            preferences.clear()
        }
    }
} 