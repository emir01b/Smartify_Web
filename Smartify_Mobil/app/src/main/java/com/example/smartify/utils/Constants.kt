package com.example.smartify.utils

object Constants {
    // Network
    const val NETWORK_TIMEOUT = 30L
    
    // SharedPreferences
    const val PREFS_NAME = "smartify_prefs"
    const val KEY_TOKEN = "user_token"
    const val KEY_USER_ID = "user_id"
    
    // DataStore
    const val DATASTORE_NAME = "smartify_datastore"
    
    // Navigation Routes
    object Routes {
        const val SPLASH = "splash"
        const val LOGIN = "login"
        const val REGISTER = "register"
        const val HOME = "home"
        const val PRODUCT_DETAIL = "product_detail/{productId}"
        const val CART = "cart"
        const val WISHLIST = "wishlist"
        const val PROFILE = "profile"
        const val ORDERS = "orders"
        const val ORDER_DETAIL = "order_detail/{orderId}"
        const val CHECKOUT = "checkout"
    }
    
    // UI Constants
    const val DEFAULT_PADDING = 16
    const val DEFAULT_CORNER_RADIUS = 8
    
    // Network Error Messages
    const val ERROR_NO_INTERNET = "İnternet bağlantısı bulunamadı"
    const val ERROR_SERVER = "Sunucu hatası, lütfen daha sonra tekrar deneyin"
    const val ERROR_TIMEOUT = "Bağlantı zaman aşımına uğradı, lütfen tekrar deneyin"
    const val ERROR_UNKNOWN = "Bilinmeyen bir hata oluştu, lütfen tekrar deneyin"
} 