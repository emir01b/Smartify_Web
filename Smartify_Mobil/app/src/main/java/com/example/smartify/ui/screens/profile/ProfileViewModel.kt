package com.example.smartify.ui.screens.profile

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.smartify.api.models.User
import com.example.smartify.api.repository.AuthRepository
import com.example.smartify.utils.NetworkResult
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class ProfileViewModel @Inject constructor(
    private val authRepository: AuthRepository
) : ViewModel() {

    private val _profileState = MutableStateFlow<ProfileState>(ProfileState.Loading)
    val profileState: StateFlow<ProfileState> = _profileState.asStateFlow()

    private val _isLoggedIn = MutableStateFlow(false)
    val isLoggedIn: StateFlow<Boolean> = _isLoggedIn.asStateFlow()

    companion object {
        private const val TAG = "ProfileViewModel"
    }

    init {
        Log.d(TAG, "ProfileViewModel initialized")
        viewModelScope.launch {
            checkLoginStatus()
        }
    }

    // Oturum durumunu kontrol et ve profil bilgilerini yükle
    fun checkLoginStatus() {
        viewModelScope.launch {
            try {
                Log.d(TAG, "Oturum durumu kontrol ediliyor")
                val token = authRepository.isLoggedIn().first()
                Log.d(TAG, "Token durumu: " + (if (!token.isNullOrEmpty()) "MEVCUT (${token.take(15)}...)" else "BOŞ"))
                
                _isLoggedIn.value = !token.isNullOrEmpty()
                Log.d(TAG, "IsLoggedIn değeri: ${_isLoggedIn.value}")
                
                if (_isLoggedIn.value) {
                    Log.d(TAG, "Oturum açık, profil yükleniyor...")
                    loadUserProfile()
                } else {
                    Log.w(TAG, "Oturum açık değil, giriş ekranına yönlendiriliyor")
                    _profileState.value = ProfileState.Error("Lütfen giriş yapın")
                }
            } catch (e: Exception) {
                Log.e(TAG, "Oturum kontrol edilirken hata: ${e.message}", e)
                _profileState.value = ProfileState.Error("Oturum durumu kontrol edilirken hata oluştu")
                _isLoggedIn.value = false
            }
        }
    }

    fun loadUserProfile() {
        viewModelScope.launch {
            val token = authRepository.isLoggedIn().first()
            if (token.isNullOrEmpty()) {
                Log.w(TAG, "Profil yüklenemedi: Token bulunamadı")
                _profileState.value = ProfileState.Error("Lütfen giriş yapın")
                _isLoggedIn.value = false
                return@launch
            }

            Log.d(TAG, "Profil yükleniyor. Token mevcut: ${token.take(15)}...")
            _profileState.value = ProfileState.Loading
            
            // API'den profil yüklemeyi dene
            val result = authRepository.getUserProfile()
            
            when (result) {
                is NetworkResult.Success -> {
                    Log.d(TAG, "Profil başarıyla yüklendi: ${result.data.name}")
                    _profileState.value = ProfileState.Success(result.data)
                }
                is NetworkResult.Error -> {
                    Log.e(TAG, "Profil yüklenirken hata: ${result.message}")
                    
                    // API hatası durumunda yerel depolamadan kullanıcı bilgilerini al
                    Log.w(TAG, "API hatası oluştu, yerel depolamadan bilgiler kontrol ediliyor...")
                    val localUser = authRepository.getUserInfoFromStorage()
                    
                    if (localUser != null) {
                        Log.d(TAG, "Yerel depolamadan kullanıcı bilgileri yüklendi: ${localUser.name}")
                        _profileState.value = ProfileState.Success(localUser)
                        return@launch
                    }
                    
                    _profileState.value = ProfileState.Error(result.message ?: "Profil bilgileri alınamadı")
                    
                    // 404 hatası için özel işlem - kullanıcı bulunamadı hatası geçici olarak tolere edilecek
                    if (result.message?.contains("Kullanıcı bulunamadı") == true || 
                        result.message?.contains("404") == true) {
                        Log.w(TAG, "Kullanıcı bulunamadı hatası alındı, oturum korunuyor")
                        
                        // API hatası durumunda geçici kullanıcı bilgileri oluştur
                        createTempUserProfile()
                    }
                    // Sadece 401 hatası oturumu temizleyecek
                    else if (result.message?.contains("401") == true) {
                        Log.w(TAG, "Yetkilendirme hatası (401). Oturum temizleniyor.")
                        authRepository.logout()
                        _isLoggedIn.value = false
                    }
                }
                NetworkResult.Loading -> {
                    _profileState.value = ProfileState.Loading
                }
            }
        }
    }

    fun logout() {
        viewModelScope.launch {
            authRepository.logout()
            _isLoggedIn.value = false
        }
    }

    // API hatası durumunda geçici kullanıcı profili oluştur
    private fun createTempUserProfile() {
        viewModelScope.launch {
            val localUser = authRepository.getUserInfoFromStorage()
            
            if (localUser != null) {
                Log.d(TAG, "Yerel depolamadan kullanıcı bilgileri bulundu: ${localUser.name}")
                _profileState.value = ProfileState.Success(localUser)
                return@launch
            }
            
            val tempUser = User(
                id = "temp_id",
                name = "Geçici Kullanıcı",
                email = "kullanici@ornek.com", 
                createdAt = "",
                updatedAt = null
            )
            _profileState.value = ProfileState.Success(tempUser)
            Log.d(TAG, "Geçici kullanıcı profili oluşturuldu")
        }
    }
}

sealed class ProfileState {
    object Loading : ProfileState()
    data class Success(val user: User) : ProfileState()
    data class Error(val message: String) : ProfileState()
} 