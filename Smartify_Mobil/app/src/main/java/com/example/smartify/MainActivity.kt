package com.example.smartify

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.example.smartify.ui.chat.ChatScreen
import com.example.smartify.ui.components.BottomNavigationBar
import com.example.smartify.ui.navigation.AppNavigation
import com.example.smartify.ui.theme.SmartifyTheme
import com.example.smartify.utils.Constants
import com.example.smartify.utils.ThemeManager
import dagger.hilt.android.AndroidEntryPoint
import javax.inject.Inject

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    
    @Inject
    lateinit var themeManager: ThemeManager
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            SmartifyTheme(themeManager = themeManager) {
                SmartifyAppContent()
            }
        }
    }
}

@Composable
fun SmartifyAppContent() {
    val navController = rememberNavController()
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route
    
    // Bottom Navigation'ın gösterileceği ekranlar
    val showBottomBar = currentRoute == Constants.Routes.HOME || 
                        currentRoute == Constants.Routes.SEARCH || 
                        currentRoute == Constants.Routes.CART || 
                        currentRoute == Constants.Routes.PROFILE
    
    Box(modifier = Modifier.fillMaxSize()) {
        Scaffold(
            modifier = Modifier.fillMaxSize(),
            bottomBar = {
                if (showBottomBar) {
                    BottomNavigationBar(
                        navController = navController,
                        onItemClick = { route ->
                            navController.navigate(route) {
                                popUpTo(navController.graph.startDestinationId)
                                launchSingleTop = true
                            }
                        }
                    )
                }
            }
        ) { innerPadding ->
            AppNavigation(
                navController = navController,
                modifier = Modifier.padding(innerPadding)
            )
        }
        
        // Chat ekranı burada tüm ekranların üzerinde görüntülenir
        ChatScreen()
    }
}