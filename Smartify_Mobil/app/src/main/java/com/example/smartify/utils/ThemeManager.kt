package com.example.smartify.utils

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.preferencesDataStore
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

private val Context.themeDataStore: DataStore<Preferences> by preferencesDataStore(
    name = "theme_preferences"
)

@Singleton
class ThemeManager @Inject constructor(
    @ApplicationContext private val context: Context
) {
    private val dataStore = context.themeDataStore

    companion object {
        private val DARK_THEME_KEY = booleanPreferencesKey("dark_theme")
        private val SYSTEM_THEME_KEY = booleanPreferencesKey("use_system_theme")
    }

    // Dark temanın etkinleştirilip etkinleştirilmediğini izler
    val isDarkThemeEnabled: Flow<Boolean> = dataStore.data.map { preferences ->
        preferences[DARK_THEME_KEY] ?: false
    }

    // Sistem temasının kullanılıp kullanılmadığını izler
    val isSystemThemeEnabled: Flow<Boolean> = dataStore.data.map { preferences ->
        preferences[SYSTEM_THEME_KEY] ?: true // Varsayılan olarak sistem teması kullanılır
    }

    // Dark tema ayarını değiştirir
    suspend fun setDarkTheme(enabled: Boolean) {
        dataStore.edit { preferences ->
            preferences[DARK_THEME_KEY] = enabled
        }
    }

    // Sistem teması kullanımını değiştirir
    suspend fun setUseSystemTheme(enabled: Boolean) {
        dataStore.edit { preferences ->
            preferences[SYSTEM_THEME_KEY] = enabled
        }
    }
} 