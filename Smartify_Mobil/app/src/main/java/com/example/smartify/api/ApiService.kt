package com.example.smartify.api

import com.example.smartify.api.models.*
import retrofit2.Response
import retrofit2.http.*

interface ApiService {
    // Ürünlerle İlgili Endpoint'ler
    @GET("products")
    suspend fun getProducts(
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 10,
        @Query("category") category: String? = null,
        @Query("search") search: String? = null,
        @Query("sort") sort: String? = null,
        @Query("minPrice") minPrice: Double? = null,
        @Query("maxPrice") maxPrice: Double? = null
    ): Response<ApiResponse<ProductsResponse>>

    @GET("products/{id}")
    suspend fun getProductById(@Path("id") id: String): Response<ApiResponse<Product>>

    // Kimlik Doğrulama Endpoint'leri
    @POST("auth/login")
    suspend fun login(@Body loginRequest: LoginRequest): Response<AuthResponse>

    @POST("auth/register")
    suspend fun register(@Body registerRequest: RegisterRequest): Response<AuthResponse>

    // Sepet Endpoint'leri
    @GET("cart")
    suspend fun getCart(): Response<ApiResponse<Cart>>

    @POST("cart")
    suspend fun addToCart(@Body cartItem: CartItem): Response<ApiResponse<Cart>>

    @PUT("cart/{productId}")
    suspend fun updateCartItem(
        @Path("productId") productId: String,
        @Body quantity: Map<String, Int>
    ): Response<ApiResponse<Cart>>

    @DELETE("cart/{productId}")
    suspend fun removeFromCart(@Path("productId") productId: String): Response<ApiResponse<Cart>>

    // Favori Ürünler Endpoint'leri
    @GET("wishlist")
    suspend fun getWishlist(): Response<ApiResponse<Wishlist>>

    @POST("wishlist")
    suspend fun addToWishlist(@Body product: Map<String, String>): Response<ApiResponse<Wishlist>>

    @DELETE("wishlist/{productId}")
    suspend fun removeFromWishlist(@Path("productId") productId: String): Response<ApiResponse<Wishlist>>

    // Sipariş Endpoint'leri
    @GET("orders")
    suspend fun getOrders(): Response<ApiResponse<List<Order>>>

    @GET("orders/{id}")
    suspend fun getOrderById(@Path("id") id: String): Response<ApiResponse<Order>>

    @POST("orders")
    suspend fun createOrder(@Body order: Order): Response<ApiResponse<Order>>

    // Kullanıcı Profili Endpoint'leri
    @GET("profile")
    suspend fun getUserProfile(): Response<ApiResponse<User>>

    @PUT("profile")
    suspend fun updateUserProfile(@Body user: User): Response<ApiResponse<User>>
} 