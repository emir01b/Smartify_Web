package com.example.smartify.utils

object Constants {
    // Network
    const val NETWORK_TIMEOUT = 30L
    
    // SharedPreferences
    const val PREFS_NAME = "smartify_prefs"
    const val KEY_TOKEN = "user_token"
    const val KEY_USER_ID = "user_id"
    const val KEY_USER_NAME = "user_name"
    const val KEY_USER_EMAIL = "user_email"
    const val KEY_USER_JSON = "user_json"
    
    // DataStore
    const val DATASTORE_NAME = "smartify_datastore"
    
    // Cart DataStore Keys
    const val KEY_CART_ITEMS = "cart_items"
    const val KEY_CART_ID = "cart_id"
    
    // Navigation Routes
    object Routes {
        const val SPLASH = "splash"
        const val LOGIN = "login"
        const val REGISTER = "register"
        const val HOME = "home"
        const val SEARCH = "search"
        const val PRODUCT_DETAIL = "product_detail/{productId}"
        const val CART = "cart"
        const val WISHLIST = "wishlist"
        const val PROFILE = "profile"
        const val ORDERS = "orders"
        const val ORDER_DETAIL = "order_detail/{orderId}"
        const val CHECKOUT = "checkout"
        const val SETTINGS = "settings"
        const val ADDRESSES = "addresses"
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