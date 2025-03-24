package com.example.smartify.data.local.dao

import androidx.room.*
import com.example.smartify.data.local.entities.WishlistEntity
import com.example.smartify.data.local.entities.WishlistProductEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface WishlistDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertWishlist(wishlist: WishlistEntity)
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertWishlistProducts(products: List<WishlistProductEntity>)
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertWishlistProduct(product: WishlistProductEntity)
    
    @Transaction
    @Query("SELECT * FROM wishlist WHERE userId = :userId")
    fun getWishlistWithProducts(userId: String): Flow<WishlistWithProducts?>
    
    @Query("SELECT * FROM wishlist_products WHERE wishlistId = :wishlistId AND productId = :productId")
    suspend fun getWishlistProductByProductId(wishlistId: String, productId: String): WishlistProductEntity?
    
    @Query("DELETE FROM wishlist_products WHERE wishlistId = :wishlistId AND productId = :productId")
    suspend fun deleteWishlistProductByProductId(wishlistId: String, productId: String)
    
    @Query("DELETE FROM wishlist WHERE id = :wishlistId")
    suspend fun deleteWishlist(wishlistId: String)
    
    @Query("DELETE FROM wishlist_products WHERE wishlistId = :wishlistId")
    suspend fun clearWishlistProducts(wishlistId: String)
}

data class WishlistWithProducts(
    @Embedded val wishlist: WishlistEntity,
    @Relation(
        parentColumn = "id",
        entityColumn = "wishlistId"
    )
    val products: List<WishlistProductEntity>
) 