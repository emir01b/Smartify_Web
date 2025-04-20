package com.example.smartify.ui.components

import androidx.compose.foundation.layout.size
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavHostController
import androidx.navigation.compose.currentBackStackEntryAsState
import com.example.smartify.ui.navigation.BottomNavigationItem

@Composable
fun BottomNavigationBar(
    navController: NavHostController,
    onItemClick: (String) -> Unit
) {
    val items = BottomNavigationItem.items
    
    val navBackStackEntry = navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry.value?.destination?.route
    
    NavigationBar(
        containerColor = MaterialTheme.colorScheme.background,
        contentColor = MaterialTheme.colorScheme.onBackground
    ) {
        items.forEach { item ->
            val selected = currentRoute == item.route
            
            NavigationBarItem(
                icon = {
                    Icon(
                        painter = painterResource(id = item.iconId),
                        contentDescription = item.title,
                        modifier = Modifier.size(24.dp)
                    )
                },
                label = { 
                    Text(
                        text = item.title,
                        fontSize = 10.sp
                    )
                },
                selected = selected,
                alwaysShowLabel = true,
                onClick = { onItemClick(item.route) },
                colors = NavigationBarItemDefaults.colors(
                    selectedIconColor = MaterialTheme.colorScheme.primary,
                    selectedTextColor = MaterialTheme.colorScheme.primary,
                    unselectedIconColor = Color.Gray,
                    unselectedTextColor = Color.Gray,
                    indicatorColor = MaterialTheme.colorScheme.background
                )
            )
        }
    }
} 