package com.example.smartify.ui.screens.login

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.smartify.api.models.AuthResponse
import com.example.smartify.api.repository.AuthRepository
import com.example.smartify.utils.NetworkResult
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class LoginViewModel @Inject constructor(
    private val authRepository: AuthRepository
) : ViewModel() {

    private val _loginState = MutableStateFlow<LoginState>(LoginState.Idle)
    val loginState: StateFlow<LoginState> = _loginState.asStateFlow()

    private val _email = MutableStateFlow("")
    val email: StateFlow<String> = _email.asStateFlow()

    private val _password = MutableStateFlow("")
    val password: StateFlow<String> = _password.asStateFlow()

    private val _emailError = MutableStateFlow<String?>(null)
    val emailError: StateFlow<String?> = _emailError.asStateFlow()

    private val _passwordError = MutableStateFlow<String?>(null)
    val passwordError: StateFlow<String?> = _passwordError.asStateFlow()

    fun onEmailChange(newEmail: String) {
        _email.value = newEmail
        _emailError.value = null
    }

    fun onPasswordChange(newPassword: String) {
        _password.value = newPassword
        _passwordError.value = null
    }

    fun login() {
        if (!validateInputs()) {
            return
        }

        _loginState.value = LoginState.Loading
        viewModelScope.launch {
            val result = authRepository.login(_email.value, _password.value)
            
            when (result) {
                is NetworkResult.Success -> {
                    val authResponse = result.data
                    Log.d("LoginViewModel", "Login başarılı: ${authResponse.user.name} (${authResponse.user.email})")
                    Log.d("LoginViewModel", "Token alındı: ${authResponse.token.take(15)}... (${authResponse.token.length} karakter)")
                    
                    // Token'ı kaydet
                    Log.d("LoginViewModel", "Token ve kullanıcı bilgileri kaydediliyor...")
                    authRepository.saveAuthData(authResponse)
                    
                    // Kaydettikten sonra kısa bir gecikme
                    delay(300)
                    Log.d("LoginViewModel", "Token kaydedildi, oturum açıldı")
                    
                    _loginState.value = LoginState.Success(authResponse)
                }
                is NetworkResult.Error -> {
                    Log.e("LoginViewModel", "Login hatası: ${result.message}")
                    _loginState.value = LoginState.Error(result.message ?: "Bilinmeyen hata")
                }
                NetworkResult.Loading -> {
                    _loginState.value = LoginState.Loading
                }
            }
        }
    }

    private fun validateInputs(): Boolean {
        var isValid = true

        if (_email.value.isBlank()) {
            _emailError.value = "E-posta adresi boş olamaz"
            isValid = false
        } else if (!android.util.Patterns.EMAIL_ADDRESS.matcher(_email.value).matches()) {
            _emailError.value = "Geçerli bir e-posta adresi girin"
            isValid = false
        }

        if (_password.value.isBlank()) {
            _passwordError.value = "Şifre boş olamaz"
            isValid = false
        } else if (_password.value.length < 6) {
            _passwordError.value = "Şifre en az 6 karakter olmalıdır"
            isValid = false
        }

        return isValid
    }

    fun resetState() {
        _loginState.value = LoginState.Idle
    }
}

sealed class LoginState {
    object Idle : LoginState()
    object Loading : LoginState()
    data class Success(val data: AuthResponse) : LoginState()
    data class Error(val message: String) : LoginState()
} 