package com.example.smartify.ui.theme

import android.app.Activity
import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.platform.LocalContext
import com.example.smartify.utils.ThemeManager

private val DarkColorScheme = darkColorScheme(
    primary = Purple80,
    secondary = PurpleGrey80,
    tertiary = Pink80
)

private val LightColorScheme = lightColorScheme(
    primary = Purple40,
    secondary = PurpleGrey40,
    tertiary = Pink40

    /* Other default colors to override
    background = Color(0xFFFFFBFE),
    surface = Color(0xFFFFFBFE),
    onPrimary = Color.White,
    onSecondary = Color.White,
    onTertiary = Color.White,
    onBackground = Color(0xFF1C1B1F),
    onSurface = Color(0xFF1C1B1F),
    */
)

@Composable
fun SmartifyTheme(
    themeManager: ThemeManager? = null,
    darkTheme: Boolean = isSystemInDarkTheme(),
    // Dynamic color is available on Android 12+
    dynamicColor: Boolean = true,
    content: @Composable () -> Unit
) {
    // ThemeManager'dan tercihler alınır
    val useSystemTheme by themeManager?.isSystemThemeEnabled?.collectAsState(initial = true) ?: run { androidx.compose.runtime.remember { androidx.compose.runtime.mutableStateOf(true) } }
    val isDarkThemeEnabled by themeManager?.isDarkThemeEnabled?.collectAsState(initial = false) ?: run { androidx.compose.runtime.remember { androidx.compose.runtime.mutableStateOf(false) } }

    // Tema tercihi, sistem teması kullanılıyorsa sistem tercihine, yoksa kullanıcı tercihine göre belirlenir
    val shouldUseDarkTheme = if (useSystemTheme) darkTheme else isDarkThemeEnabled

    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            if (shouldUseDarkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        }

        shouldUseDarkTheme -> DarkColorScheme
        else -> LightColorScheme
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}