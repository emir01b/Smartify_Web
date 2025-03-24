package com.example.smartify.ui.screens.splash

import androidx.lifecycle.ViewModel
import com.example.smartify.data.repository.AuthRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import javax.inject.Inject

@HiltViewModel
class SplashViewModel @Inject constructor(
    private val authRepository: AuthRepository
) : ViewModel() {
    
    fun isUserLoggedIn(): Boolean {
        return runBlocking {
            authRepository.isUserLoggedIn().first()
        }
    }
} 