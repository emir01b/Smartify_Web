package com.example.smartify

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.example.smartify.ui.components.BottomNavigationBar
import com.example.smartify.ui.navigation.AppNavigation
import com.example.smartify.ui.theme.SmartifyTheme
import com.example.smartify.utils.Constants
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            SmartifyTheme {
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
                        currentRoute == Constants.Routes.WISHLIST || 
                        currentRoute == Constants.Routes.PROFILE
    
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
}