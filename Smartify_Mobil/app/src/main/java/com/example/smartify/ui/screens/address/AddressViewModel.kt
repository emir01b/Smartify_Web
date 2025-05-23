package com.example.smartify.ui.screens.address

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.smartify.api.models.Address
import com.example.smartify.api.models.User
import com.example.smartify.api.repository.AuthRepository
import com.example.smartify.utils.NetworkResult
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class AddressViewModel @Inject constructor(
    private val authRepository: AuthRepository
) : ViewModel() {

    private val _addressState = MutableStateFlow<AddressState>(AddressState.Loading)
    val addressState: StateFlow<AddressState> = _addressState.asStateFlow()
    
    private val _isLoggedIn = MutableStateFlow(false)
    val isLoggedIn: StateFlow<Boolean> = _isLoggedIn.asStateFlow()
    
    private val _updateState = MutableStateFlow<UpdateState>(UpdateState.Idle)
    val updateState: StateFlow<UpdateState> = _updateState.asStateFlow()
    
    companion object {
        private const val TAG = "AddressViewModel"
    }
    
    init {
        Log.d(TAG, "AddressViewModel initialized")
        checkLoginStatus()
    }
    
    // Oturum durumunu kontrol et
    fun checkLoginStatus() {
        viewModelScope.launch {
            try {
                Log.d(TAG, "Oturum durumu kontrol ediliyor")
                val token = authRepository.isLoggedIn().first()
                Log.d(TAG, "Token durumu: " + (if (!token.isNullOrEmpty()) "MEVCUT" else "BOŞ"))
                
                _isLoggedIn.value = !token.isNullOrEmpty()
                Log.d(TAG, "IsLoggedIn değeri: ${_isLoggedIn.value}")
                
                if (_isLoggedIn.value) {
                    Log.d(TAG, "Oturum açık, adres bilgileri yükleniyor...")
                    loadAddressInfo()
                } else {
                    Log.w(TAG, "Oturum açık değil")
                    _addressState.value = AddressState.Error("Lütfen giriş yapın")
                }
            } catch (e: Exception) {
                Log.e(TAG, "Oturum kontrol edilirken hata: ${e.message}", e)
                _addressState.value = AddressState.Error("Oturum durumu kontrol edilirken hata oluştu")
                _isLoggedIn.value = false
            }
        }
    }
    
    // Adres bilgilerini yükle
    fun loadAddressInfo() {
        viewModelScope.launch {
            try {
                _addressState.value = AddressState.Loading
                
                // API'den adres bilgilerini al
                val result = authRepository.getUserProfileAndAddress()
                
                when (result) {
                    is NetworkResult.Success -> {
                        Log.d(TAG, "Adres bilgileri başarıyla alındı")
                        val user = result.data
                        _addressState.value = AddressState.Success(user)
                    }
                    is NetworkResult.Error -> {
                        Log.e(TAG, "Adres bilgileri alınırken hata: ${result.message}")
                        
                        // API hatası durumunda yerel depolamadan bilgileri al
                        val localUser = authRepository.getUserInfoFromStorage()
                        
                        if (localUser != null) {
                            Log.d(TAG, "Yerel depolamadan kullanıcı bilgileri yüklendi")
                            _addressState.value = AddressState.Success(localUser)
                            return@launch
                        }
                        
                        _addressState.value = AddressState.Error(result.message ?: "Adres bilgileri alınamadı")
                    }
                    NetworkResult.Loading -> {
                        _addressState.value = AddressState.Loading
                    }
                }
            } catch (e: Exception) {
                Log.e(TAG, "Adres bilgileri yüklenirken hata: ${e.message}", e)
                _addressState.value = AddressState.Error("Adres bilgileri yüklenirken hata oluştu")
            }
        }
    }
    
    // Adres bilgilerini güncelle
    fun updateAddress(address: Address) {
        viewModelScope.launch {
            try {
                _updateState.value = UpdateState.Loading
                
                // API'ye adres güncellemesini gönder
                val result = authRepository.updateUserAddress(address)
                
                when (result) {
                    is NetworkResult.Success -> {
                        Log.d(TAG, "Adres bilgileri başarıyla güncellendi")
                        val user = result.data
                        _addressState.value = AddressState.Success(user)
                        _updateState.value = UpdateState.Success("Adresiniz başarıyla güncellendi")
                        
                        // Başarılı mesajını kısa süre sonra temizle
                        delay(2000)
                        _updateState.value = UpdateState.Idle
                    }
                    is NetworkResult.Error -> {
                        Log.e(TAG, "Adres bilgileri güncellenirken hata: ${result.message}")
                        _updateState.value = UpdateState.Error(result.message ?: "Adres güncellenirken bir hata oluştu")
                        
                        // Hata mesajını kısa süre sonra temizle
                        delay(3000)
                        _updateState.value = UpdateState.Idle
                    }
                    NetworkResult.Loading -> {
                        _updateState.value = UpdateState.Loading
                    }
                }
            } catch (e: Exception) {
                Log.e(TAG, "Adres güncellenirken beklenmeyen hata: ${e.message}", e)
                _updateState.value = UpdateState.Error("Adres güncellenirken beklenmeyen hata oluştu")
                
                // Hata mesajını kısa süre sonra temizle
                delay(3000)
                _updateState.value = UpdateState.Idle
            }
        }
    }
}

// Adres durumu için sealed class
sealed class AddressState {
    object Loading : AddressState()
    data class Success(val user: User) : AddressState()
    data class Error(val message: String) : AddressState()
}

// Güncelleme durumu için sealed class
sealed class UpdateState {
    object Idle : UpdateState()
    object Loading : UpdateState()
    data class Success(val message: String) : UpdateState()
    data class Error(val message: String) : UpdateState()
} 