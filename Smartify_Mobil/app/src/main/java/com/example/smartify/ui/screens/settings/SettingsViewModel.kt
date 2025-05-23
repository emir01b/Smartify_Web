package com.example.smartify.ui.screens.settings

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.smartify.utils.ThemeManager
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class SettingsViewModel @Inject constructor(
    private val themeManager: ThemeManager
) : ViewModel() {
    
    // Tema ayarları
    val isDarkThemeEnabled: Flow<Boolean> = themeManager.isDarkThemeEnabled
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.Eagerly,
            initialValue = false
        )
    
    val isSystemThemeEnabled: Flow<Boolean> = themeManager.isSystemThemeEnabled
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.Eagerly,
            initialValue = true
        )
    
    // Dark temayı etkinleştir veya devre dışı bırak
    fun setDarkTheme(enabled: Boolean) {
        viewModelScope.launch {
            themeManager.setDarkTheme(enabled)
        }
    }
    
    // Sistem teması kullanımını etkinleştir veya devre dışı bırak
    fun setUseSystemTheme(enabled: Boolean) {
        viewModelScope.launch {
            themeManager.setUseSystemTheme(enabled)
        }
    }
} 