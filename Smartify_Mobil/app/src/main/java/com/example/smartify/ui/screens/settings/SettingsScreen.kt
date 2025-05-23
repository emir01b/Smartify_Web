package com.example.smartify.ui.screens.settings

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(
    onNavigateBack: () -> Unit,
    viewModel: SettingsViewModel = hiltViewModel()
) {
    val isDarkThemeEnabled by viewModel.isDarkThemeEnabled.collectAsState(initial = false)
    val isSystemThemeEnabled by viewModel.isSystemThemeEnabled.collectAsState(initial = true)
    
    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = { Text("Uygulama Ayarları") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Geri"
                        )
                    }
                },
                colors = TopAppBarDefaults.centerAlignedTopAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface,
                    titleContentColor = MaterialTheme.colorScheme.onSurface
                )
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .verticalScroll(rememberScrollState())
                .padding(16.dp)
        ) {
            // Tema Ayarları Başlığı
            SettingsSectionHeader(
                title = "Tema Ayarları",
                icon = Icons.Default.DarkMode
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            // Sistem Teması Kullan
            SettingsSwitchItem(
                title = "Sistem Temasını Kullan",
                description = "Telefonunuzun temasını kullanır",
                icon = Icons.Default.Settings,
                checked = isSystemThemeEnabled,
                onCheckedChange = { viewModel.setUseSystemTheme(it) }
            )
            
            // Karanlık Tema
            SettingsSwitchItem(
                title = "Karanlık Tema",
                description = "Uygulamada karanlık temayı etkinleştirir",
                icon = Icons.Default.NightlightRound,
                checked = isDarkThemeEnabled,
                enabled = !isSystemThemeEnabled,
                onCheckedChange = { viewModel.setDarkTheme(it) }
            )
            
            Spacer(modifier = Modifier.height(32.dp))
            
            // Bildirim Ayarları Başlığı
            SettingsSectionHeader(
                title = "Bildirim Ayarları",
                icon = Icons.Default.Notifications
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            // Diğer ayarlar buraya eklenebilir
            SettingsSwitchItem(
                title = "Bildirimler",
                description = "Tüm bildirimleri etkinleştirir veya devre dışı bırakır",
                icon = Icons.Default.NotificationsActive,
                checked = true, // Bu değer gerçek bir ayardan gelmeli
                onCheckedChange = { /* Bildirim ayarları değiştiğinde */ }
            )
            
            SettingsSwitchItem(
                title = "Promosyon Bildirimleri",
                description = "İndirim ve fırsatlardan haberdar olun",
                icon = Icons.Default.LocalOffer,
                checked = true, // Bu değer gerçek bir ayardan gelmeli
                onCheckedChange = { /* Promosyon bildirimleri değiştiğinde */ }
            )
            
            Spacer(modifier = Modifier.height(32.dp))
            
            // Hakkında Bölümü
            SettingsSectionHeader(
                title = "Uygulama Bilgileri",
                icon = Icons.Default.Info
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            SettingsInfoItem(
                title = "Uygulama Sürümü",
                description = "1.0.0",
                icon = Icons.Default.Update
            )
            
            SettingsInfoItem(
                title = "Geliştirici",
                description = "SmartifyTech",
                icon = Icons.Default.Person
            )
        }
    }
}

@Composable
fun SettingsSectionHeader(
    title: String,
    icon: ImageVector
) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier.padding(vertical = 8.dp)
    ) {
        Box(
            modifier = Modifier
                .size(40.dp)
                .clip(CircleShape)
                .background(MaterialTheme.colorScheme.primaryContainer),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.onPrimaryContainer
            )
        }
        
        Spacer(modifier = Modifier.width(16.dp))
        
        Text(
            text = title,
            style = MaterialTheme.typography.titleLarge,
            fontWeight = FontWeight.Bold
        )
    }
}

@Composable
fun SettingsSwitchItem(
    title: String,
    description: String,
    icon: ImageVector,
    checked: Boolean,
    enabled: Boolean = true,
    onCheckedChange: (Boolean) -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 6.dp),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        )
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .clip(CircleShape)
                    .background(
                        if (enabled) MaterialTheme.colorScheme.secondaryContainer
                        else MaterialTheme.colorScheme.secondaryContainer.copy(alpha = 0.5f)
                    ),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = if (enabled) MaterialTheme.colorScheme.onSecondaryContainer
                          else MaterialTheme.colorScheme.onSecondaryContainer.copy(alpha = 0.5f)
                )
            }
            
            Spacer(modifier = Modifier.width(16.dp))
            
            Column(
                modifier = Modifier.weight(1f)
            ) {
                Text(
                    text = title,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.SemiBold,
                    color = if (enabled) MaterialTheme.colorScheme.onSurface
                           else MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f)
                )
                
                Text(
                    text = description,
                    style = MaterialTheme.typography.bodySmall,
                    color = if (enabled) MaterialTheme.colorScheme.onSurfaceVariant
                           else MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.5f)
                )
            }
            
            Switch(
                checked = checked,
                onCheckedChange = onCheckedChange,
                enabled = enabled
            )
        }
    }
}

@Composable
fun SettingsInfoItem(
    title: String,
    description: String,
    icon: ImageVector
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 6.dp),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        )
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .clip(CircleShape)
                    .background(MaterialTheme.colorScheme.tertiaryContainer),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.onTertiaryContainer
                )
            }
            
            Spacer(modifier = Modifier.width(16.dp))
            
            Column(
                modifier = Modifier.weight(1f)
            ) {
                Text(
                    text = title,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.SemiBold
                )
                
                Text(
                    text = description,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
} 