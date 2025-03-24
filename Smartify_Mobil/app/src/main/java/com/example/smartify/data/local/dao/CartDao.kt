package com.example.smartify.data.local.dao

import androidx.room.*
import com.example.smartify.data.local.entities.CartEntity
import com.example.smartify.data.local.entities.CartItemEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface CartDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertCart(cart: CartEntity)
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertCartItems(items: List<CartItemEntity>)
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertCartItem(item: CartItemEntity)
    
    @Transaction
    @Query("SELECT * FROM cart WHERE userId = :userId")
    fun getCartWithItems(userId: String): Flow<CartWithItems?>
    
    @Query("SELECT * FROM cart_items WHERE cartId = :cartId AND productId = :productId")
    suspend fun getCartItemByProductId(cartId: String, productId: String): CartItemEntity?
    
    @Query("DELETE FROM cart_items WHERE cartId = :cartId AND productId = :productId")
    suspend fun deleteCartItemByProductId(cartId: String, productId: String)
    
    @Query("DELETE FROM cart WHERE id = :cartId")
    suspend fun deleteCart(cartId: String)
    
    @Query("UPDATE cart_items SET quantity = :quantity WHERE cartId = :cartId AND productId = :productId")
    suspend fun updateCartItemQuantity(cartId: String, productId: String, quantity: Int)
    
    @Query("DELETE FROM cart_items WHERE cartId = :cartId")
    suspend fun clearCartItems(cartId: String)
}

data class CartWithItems(
    @Embedded val cart: CartEntity,
    @Relation(
        parentColumn = "id",
        entityColumn = "cartId"
    )
    val items: List<CartItemEntity>
) 