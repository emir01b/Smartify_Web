package com.example.smartify.api

import com.example.smartify.api.models.*
import retrofit2.Response
import retrofit2.http.*

interface ApiService {
    // Ürünlerle İlgili Endpoint'ler
    @GET("api/products")
    suspend fun getProducts(
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20,
        @Query("category") category: String? = null,
        @Query("search") search: String? = null,
        @Query("sort") sort: String? = null,
        @Query("minPrice") minPrice: Double? = null,
        @Query("maxPrice") maxPrice: Double? = null
    ): Response<List<Product>>

    @GET("api/products/{id}")
    suspend fun getProductById(@Path("id") id: String): Response<Product>

    @GET("api/products")
    suspend fun getProductsByCategory(@Query("category") category: String): Response<List<Product>>

    @GET("api/products")
    suspend fun searchProducts(@Query("search") query: String): Response<List<Product>>

    // Kimlik Doğrulama Endpoint'leri
    @POST("api/auth/login")
    suspend fun login(@Body loginRequest: LoginRequest): Response<AuthResponse>

    @POST("api/auth/register")
    suspend fun register(@Body registerRequest: RegisterRequest): Response<AuthResponse>

    // Sepet Endpoint'leri
    @GET("api/cart")
    suspend fun getCart(): Response<ApiResponse<Cart>>

    @POST("api/cart")
    suspend fun addToCart(@Body cartItem: CartItem): Response<ApiResponse<Cart>>

    @PUT("api/cart/{productId}")
    suspend fun updateCartItem(
        @Path("productId") productId: String,
        @Body quantity: Map<String, Int>
    ): Response<ApiResponse<Cart>>

    @DELETE("api/cart/{productId}")
    suspend fun removeFromCart(@Path("productId") productId: String): Response<ApiResponse<Cart>>

    // Favori Ürünler Endpoint'leri
    @GET("api/wishlist")
    suspend fun getWishlist(): Response<ApiResponse<Wishlist>>

    @POST("api/wishlist")
    suspend fun addToWishlist(@Body product: Map<String, String>): Response<ApiResponse<Wishlist>>

    @DELETE("api/wishlist/{productId}")
    suspend fun removeFromWishlist(@Path("productId") productId: String): Response<ApiResponse<Wishlist>>

    // Sipariş Endpoint'leri
    @GET("api/orders")
    suspend fun getOrders(): Response<ApiResponse<List<Order>>>

    @GET("api/orders/{id}")
    suspend fun getOrderById(@Path("id") id: String): Response<ApiResponse<Order>>

    @POST("api/orders")
    suspend fun createOrder(@Body order: Order): Response<ApiResponse<Order>>

    // Kullanıcı Profili Endpoint'leri
    @GET("api/profile")
    suspend fun getUserProfile(): Response<ApiResponse<User>>

    @PUT("api/profile")
    suspend fun updateUserProfile(@Body user: User): Response<ApiResponse<User>>
}

data class ApiResponse<T>(
    val success: Boolean,
    val message: String?,
    val data: T?
)

// DummyJSON için yanıt sınıfları
data class DummyJsonProductResponse(
    val products: List<Product>,
    val total: Int,
    val skip: Int,
    val limit: Int
) 