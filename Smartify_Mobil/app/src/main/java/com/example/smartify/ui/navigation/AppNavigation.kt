package com.example.smartify.ui.navigation

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.navArgument
import com.example.smartify.ui.screens.cart.CartScreen
import com.example.smartify.ui.screens.home.HomeScreen
import com.example.smartify.ui.screens.login.LoginScreen
import com.example.smartify.ui.screens.profile.ProfileScreen
import com.example.smartify.ui.screens.register.RegisterScreen
import com.example.smartify.ui.screens.search.SearchScreen
import com.example.smartify.ui.screens.splash.SplashScreen
import com.example.smartify.ui.screens.wishlist.WishlistScreen
import com.example.smartify.ui.screens.product_detail.ProductDetailScreen
import com.example.smartify.ui.orders.OrdersScreen
import com.example.smartify.ui.screens.settings.SettingsScreen
import com.example.smartify.ui.screens.address.AddressesScreen
import com.example.smartify.utils.Constants

@Composable
fun AppNavigation(
    navController: NavHostController,
    modifier: Modifier = Modifier
) {
    NavHost(
        navController = navController,
        startDestination = Constants.Routes.HOME,
        modifier = modifier
    ) {
        // Splash Screen
        composable(Constants.Routes.SPLASH) {
            SplashScreen(
                onNavigateToLogin = { 
                    navController.navigate(Constants.Routes.LOGIN) {
                        popUpTo(Constants.Routes.SPLASH) { inclusive = true }
                    }
                },
                onNavigateToHome = { 
                    navController.navigate(Constants.Routes.HOME) {
                        popUpTo(Constants.Routes.SPLASH) { inclusive = true }
                    }
                }
            )
        }
        
        // Login Screen
        composable(Constants.Routes.LOGIN) {
            LoginScreen(
                onNavigateToRegister = { navController.navigate(Constants.Routes.REGISTER) },
                onNavigateToHome = { 
                    navController.navigate(Constants.Routes.HOME) {
                        popUpTo(Constants.Routes.LOGIN) { inclusive = true }
                    }
                }
            )
        }
        
        // Register Screen
        composable(Constants.Routes.REGISTER) {
            RegisterScreen(
                onNavigateToLogin = { navController.popBackStack() },
                onNavigateToHome = { 
                    navController.navigate(Constants.Routes.HOME) {
                        popUpTo(Constants.Routes.REGISTER) { inclusive = true }
                    }
                }
            )
        }
        
        // Home Screen
        composable(Constants.Routes.HOME) {
            HomeScreen(
                onNavigateToProductDetail = { productId ->
                    navController.navigate(Constants.Routes.PRODUCT_DETAIL.replace("{productId}", productId))
                }
            )
        }
        
        // Search Screen
        composable(Constants.Routes.SEARCH) {
            SearchScreen(
                onNavigateToProductDetail = { productId ->
                    navController.navigate(Constants.Routes.PRODUCT_DETAIL.replace("{productId}", productId))
                }
            )
        }
        
        // Profile Screen
        composable(Constants.Routes.PROFILE) {
            ProfileScreen(
                onNavigateToOrders = { navController.navigate(Constants.Routes.ORDERS) },
                onNavigateToWishlist = { navController.navigate(Constants.Routes.WISHLIST) },
                onNavigateToAddresses = { navController.navigate(Constants.Routes.ADDRESSES) },
                onNavigateToSettings = { navController.navigate(Constants.Routes.SETTINGS) },
                onNavigateToLogin = {
                    navController.navigate(Constants.Routes.LOGIN) {
                        popUpTo(Constants.Routes.HOME) { inclusive = true }
                    }
                }
            )
        }
        
        // Cart Screen
        composable(Constants.Routes.CART) {
            CartScreen(
                onNavigateBack = { navController.popBackStack() },
                onNavigateToCheckout = { navController.navigate(Constants.Routes.CHECKOUT) }
            )
        }
        
        // Wishlist Screen
        composable(Constants.Routes.WISHLIST) {
            WishlistScreen(
                onNavigateBack = { navController.popBackStack() },
                onNavigateToProductDetail = { productId ->
                    navController.navigate(Constants.Routes.PRODUCT_DETAIL.replace("{productId}", productId))
                }
            )
        }
        
        // Product Detail Screen
        composable(
            route = Constants.Routes.PRODUCT_DETAIL,
            arguments = listOf(
                navArgument("productId") {
                    type = NavType.StringType
                }
            )
        ) { backStackEntry ->
            val productId = backStackEntry.arguments?.getString("productId") ?: ""
            ProductDetailScreen(
                productId = productId,
                onNavigateBack = { navController.popBackStack() },
                onNavigateToCart = { navController.navigate(Constants.Routes.CART) }
            )
        }
        
        // Orders Screen
        composable(Constants.Routes.ORDERS) {
            OrdersScreen(
                navigateBack = { navController.popBackStack() }
            )
        }
        
        // Order Detail Screen
        composable(
            route = Constants.Routes.ORDER_DETAIL,
            arguments = listOf(
                navArgument("orderId") {
                    type = NavType.StringType
                }
            )
        ) { backStackEntry ->
            val orderId = backStackEntry.arguments?.getString("orderId") ?: ""
            // OrderDetailScreen(
            //     orderId = orderId,
            //     onNavigateBack = { navController.popBackStack() }
            // )
        }
        
        // Checkout Screen
        composable(Constants.Routes.CHECKOUT) {
            // CheckoutScreen(
            //     onNavigateBack = { navController.popBackStack() },
            //     onNavigateToOrderDetail = { orderId ->
            //         navController.navigate(Constants.Routes.ORDER_DETAIL.replace("{orderId}", orderId)) {
            //             popUpTo(Constants.Routes.HOME)
            //         }
            //     }
            // )
        }
        
        // Settings Screen
        composable(Constants.Routes.SETTINGS) {
            SettingsScreen(
                onNavigateBack = { navController.popBackStack() }
            )
        }
        
        // Addresses Screen
        composable(Constants.Routes.ADDRESSES) {
            AddressesScreen(
                onNavigateBack = { navController.popBackStack() }
            )
        }
    }
} 