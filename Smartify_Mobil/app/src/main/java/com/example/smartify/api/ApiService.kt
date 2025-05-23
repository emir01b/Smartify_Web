package com.example.smartify.api

import com.example.smartify.api.models.*
import retrofit2.Response
import retrofit2.http.*

const val BASE_URL = "http://10.0.2.2:3000/"
const val IMAGE_BASE_URL = "${BASE_URL}uploads/"

// Resim URL'lerini düzenlemek için extension function
fun String.toFullImageUrl(): String {
    return when {
        this.startsWith("/uploads/") -> BASE_URL + this.removePrefix("/")
        this.startsWith("http://") || this.startsWith("https://") -> this
        else -> IMAGE_BASE_URL + this
    }
}

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
    suspend fun getProductsByCategory(
        @Query("category") category: String,
        @Query("limit") limit: Int = 50
    ): Response<List<Product>>

    @GET("api/products/search")
    suspend fun searchProducts(@Query("search") query: String): Response<List<Product>>

    // Kimlik Doğrulama Endpoint'leri
    @POST("api/auth/login")
    suspend fun login(@Body loginRequest: LoginRequest): Response<AuthResponse>

    @POST("api/auth/register")
    suspend fun register(@Body registerRequest: RegisterRequest): Response<AuthResponse>

    // Kullanıcı Profili Endpoint'leri
    @GET("api/auth/me")
    suspend fun getUserProfile(): Response<User>
    
    // Kullanıcı profili ve adres bilgilerini getirme
    @GET("api/users/profile")
    suspend fun getUserProfileAndAddress(): Response<User>
    
    // Kullanıcı adres bilgilerini güncelleme
    @PUT("api/users/profile")
    suspend fun updateUserAddress(@Body user: UpdateAddressRequest): Response<User>

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
    @GET("api/users/favorites")
    suspend fun getFavorites(): Response<List<Product>>

    @POST("api/users/favorites/{productId}")
    suspend fun addToFavorites(@Path("productId") productId: String): Response<FavoriteResponse>

    @DELETE("api/users/favorites/{productId}")
    suspend fun removeFromFavorites(@Path("productId") productId: String): Response<FavoriteResponse>

    // Sipariş Endpoint'leri
    @GET("api/orders")
    suspend fun getOrders(): Response<ApiResponse<List<Order>>>

    @GET("api/orders/{id}")
    suspend fun getOrderById(@Path("id") id: String): Response<ApiResponse<Order>>

    @POST("api/orders")
    suspend fun createOrder(@Body order: Order): Response<ApiResponse<Order>>

    @GET("api/orders/myorders")
    suspend fun getMyOrders(): Response<List<Order>>

    // Kullanıcı Profili Güncelleme
    @PUT("api/auth/me")
    suspend fun updateUserProfile(@Body user: User): Response<User>
}

data class ApiResponse<T>(
    val success: Boolean,
    val message: String?,
    val data: T?
)

// Adres güncelleme için istek sınıfı
data class UpdateAddressRequest(
    val address: Address
)

// DummyJSON için yanıt sınıfları
data class DummyJsonProductResponse(
    val products: List<Product>,
    val total: Int,
    val skip: Int,
    val limit: Int
) 