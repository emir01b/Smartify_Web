package com.example.smartify.ui.screens.register

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.smartify.api.models.AuthResponse
import com.example.smartify.api.repository.AuthRepository
import com.example.smartify.utils.NetworkResult
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class RegisterViewModel @Inject constructor(
    private val authRepository: AuthRepository
) : ViewModel() {

    private val _registerState = MutableStateFlow<RegisterState>(RegisterState.Idle)
    val registerState: StateFlow<RegisterState> = _registerState.asStateFlow()

    private val _name = MutableStateFlow("")
    val name: StateFlow<String> = _name.asStateFlow()

    private val _email = MutableStateFlow("")
    val email: StateFlow<String> = _email.asStateFlow()

    private val _password = MutableStateFlow("")
    val password: StateFlow<String> = _password.asStateFlow()

    private val _confirmPassword = MutableStateFlow("")
    val confirmPassword: StateFlow<String> = _confirmPassword.asStateFlow()

    private val _nameError = MutableStateFlow<String?>(null)
    val nameError: StateFlow<String?> = _nameError.asStateFlow()

    private val _emailError = MutableStateFlow<String?>(null)
    val emailError: StateFlow<String?> = _emailError.asStateFlow()

    private val _passwordError = MutableStateFlow<String?>(null)
    val passwordError: StateFlow<String?> = _passwordError.asStateFlow()

    private val _confirmPasswordError = MutableStateFlow<String?>(null)
    val confirmPasswordError: StateFlow<String?> = _confirmPasswordError.asStateFlow()

    fun onNameChange(newName: String) {
        _name.value = newName
        _nameError.value = null
    }

    fun onEmailChange(newEmail: String) {
        _email.value = newEmail
        _emailError.value = null
    }

    fun onPasswordChange(newPassword: String) {
        _password.value = newPassword
        _passwordError.value = null
    }

    fun onConfirmPasswordChange(newConfirmPassword: String) {
        _confirmPassword.value = newConfirmPassword
        _confirmPasswordError.value = null
    }

    fun register() {
        if (!validateInputs()) {
            return
        }

        _registerState.value = RegisterState.Loading
        viewModelScope.launch {
            val result = authRepository.register(_name.value, _email.value, _password.value)
            
            when (result) {
                is NetworkResult.Success -> {
                    val authResponse = result.data
                    authRepository.saveAuthData(authResponse)
                    _registerState.value = RegisterState.Success(authResponse)
                }
                is NetworkResult.Error -> {
                    _registerState.value = RegisterState.Error(result.message ?: "Bilinmeyen hata")
                }
                NetworkResult.Loading -> {
                    _registerState.value = RegisterState.Loading
                }
            }
        }
    }

    private fun validateInputs(): Boolean {
        var isValid = true

        if (_name.value.isBlank()) {
            _nameError.value = "İsim boş olamaz"
            isValid = false
        }

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

        if (_confirmPassword.value.isBlank()) {
            _confirmPasswordError.value = "Şifre onayı boş olamaz"
            isValid = false
        } else if (_confirmPassword.value != _password.value) {
            _confirmPasswordError.value = "Şifreler eşleşmiyor"
            isValid = false
        }

        return isValid
    }

    fun resetState() {
        _registerState.value = RegisterState.Idle
    }
}

sealed class RegisterState {
    object Idle : RegisterState()
    object Loading : RegisterState()
    data class Success(val data: AuthResponse) : RegisterState()
    data class Error(val message: String) : RegisterState()
} 