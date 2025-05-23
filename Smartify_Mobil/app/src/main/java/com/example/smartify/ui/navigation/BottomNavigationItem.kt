package com.example.smartify.ui.navigation

import androidx.annotation.DrawableRes
import androidx.compose.material.icons.Icons
import androidx.compose.ui.graphics.vector.ImageVector
import com.example.smartify.R
import com.example.smartify.utils.Constants

/**
 * Alt navigasyon için gerekli veri modeli
 */
sealed class BottomNavigationItem(
    val route: String,
    val title: String,
    @DrawableRes val iconId: Int
) {
    object Home : BottomNavigationItem(
        route = Constants.Routes.HOME,
        title = "Ana Sayfa",
        iconId = R.drawable.ic_home
    )
    
    object Search : BottomNavigationItem(
        route = Constants.Routes.SEARCH,
        title = "Arama",
        iconId = R.drawable.ic_search
    )
    
    object Cart : BottomNavigationItem(
        route = Constants.Routes.CART,
        title = "Sepet",
        iconId = R.drawable.ic_cart
    )
    
    object Wishlist : BottomNavigationItem(
        route = Constants.Routes.WISHLIST,
        title = "Favoriler",
        iconId = R.drawable.ic_favorite
    )
    
    object Profile : BottomNavigationItem(
        route = Constants.Routes.PROFILE,
        title = "Profil",
        iconId = R.drawable.ic_profile
    )
    
    companion object {
        val items = listOf(
            Home, Search, Cart, Profile
        )
    }
} 