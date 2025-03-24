package com.example.smartify.ui.navigation

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.navArgument
import com.example.smartify.ui.screens.splash.SplashScreen
import com.example.smartify.utils.Constants

@Composable
fun AppNavigation(
    navController: NavHostController,
    modifier: Modifier = Modifier
) {
    NavHost(
        navController = navController,
        startDestination = Constants.Routes.SPLASH,
        modifier = modifier
    ) {
        // Splash Screen
        composable(Constants.Routes.SPLASH) {
            SplashScreen(
                onNavigateToLogin = { navController.navigate(Constants.Routes.LOGIN) },
                onNavigateToHome = { navController.navigate(Constants.Routes.HOME) }
            )
        }
        
        // Login Screen
        composable(Constants.Routes.LOGIN) {
            // LoginScreen(
            //     onNavigateToRegister = { navController.navigate(Constants.Routes.REGISTER) },
            //     onNavigateToHome = { navController.navigate(Constants.Routes.HOME) }
            // )
        }
        
        // Register Screen
        composable(Constants.Routes.REGISTER) {
            // RegisterScreen(
            //     onNavigateToLogin = { navController.navigate(Constants.Routes.LOGIN) },
            //     onNavigateToHome = { navController.navigate(Constants.Routes.HOME) }
            // )
        }
        
        // Home Screen
        composable(Constants.Routes.HOME) {
            // HomeScreen(
            //     onNavigateToProductDetail = { productId ->
            //         navController.navigate(Constants.Routes.PRODUCT_DETAIL.replace("{productId}", productId))
            //     },
            //     onNavigateToCart = { navController.navigate(Constants.Routes.CART) },
            //     onNavigateToWishlist = { navController.navigate(Constants.Routes.WISHLIST) },
            //     onNavigateToProfile = { navController.navigate(Constants.Routes.PROFILE) }
            // )
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
            // ProductDetailScreen(
            //     productId = productId,
            //     onNavigateBack = { navController.popBackStack() },
            //     onNavigateToCart = { navController.navigate(Constants.Routes.CART) }
            // )
        }
        
        // Cart Screen
        composable(Constants.Routes.CART) {
            // CartScreen(
            //     onNavigateBack = { navController.popBackStack() },
            //     onNavigateToCheckout = { navController.navigate(Constants.Routes.CHECKOUT) }
            // )
        }
        
        // Wishlist Screen
        composable(Constants.Routes.WISHLIST) {
            // WishlistScreen(
            //     onNavigateBack = { navController.popBackStack() },
            //     onNavigateToProductDetail = { productId ->
            //         navController.navigate(Constants.Routes.PRODUCT_DETAIL.replace("{productId}", productId))
            //     }
            // )
        }
        
        // Profile Screen
        composable(Constants.Routes.PROFILE) {
            // ProfileScreen(
            //     onNavigateBack = { navController.popBackStack() },
            //     onNavigateToOrders = { navController.navigate(Constants.Routes.ORDERS) },
            //     onNavigateToLogin = {
            //         navController.navigate(Constants.Routes.LOGIN) {
            //             popUpTo(Constants.Routes.HOME) { inclusive = true }
            //         }
            //     }
            // )
        }
        
        // Orders Screen
        composable(Constants.Routes.ORDERS) {
            // OrdersScreen(
            //     onNavigateBack = { navController.popBackStack() },
            //     onNavigateToOrderDetail = { orderId ->
            //         navController.navigate(Constants.Routes.ORDER_DETAIL.replace("{orderId}", orderId))
            //     }
            // )
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
    }
} 