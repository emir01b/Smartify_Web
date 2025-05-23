package com.example.smartify.data.local

import androidx.room.Database
import androidx.room.RoomDatabase
import androidx.room.TypeConverters
import com.example.smartify.data.local.converters.DataConverters
import com.example.smartify.data.local.dao.CartDao
import com.example.smartify.data.local.dao.ProductDao
import com.example.smartify.data.local.entities.CartEntity
import com.example.smartify.data.local.entities.CartItemEntity
import com.example.smartify.data.local.entities.ProductEntity

@Database(
    entities = [
        ProductEntity::class,
        CartEntity::class,
        CartItemEntity::class
    ],
    version = 1,
    exportSchema = false
)
@TypeConverters(DataConverters::class)
abstract class AppDatabase : RoomDatabase() {
    abstract fun productDao(): ProductDao
    abstract fun cartDao(): CartDao
} 