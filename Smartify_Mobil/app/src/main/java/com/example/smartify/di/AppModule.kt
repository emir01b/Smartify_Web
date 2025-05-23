package com.example.smartify.di

import android.content.Context
import com.example.smartify.api.ApiService
import com.example.smartify.api.ChatApiService
import com.example.smartify.api.repository.ChatRepository
import com.example.smartify.data.local.dao.ProductDao
import com.example.smartify.data.repository.CartRepository
import com.example.smartify.data.repository.FavoritesRepository
import com.example.smartify.data.repository.ProductRepository
import com.example.smartify.utils.CartManager
import com.example.smartify.utils.SessionManager
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object RepositoryModule {
    
    @Provides
    @Singleton
    fun provideProductRepository(
        apiService: ApiService,
        productDao: ProductDao
    ): ProductRepository {
        return ProductRepository(apiService, productDao)
    }
    
    @Provides
    @Singleton
    fun provideCartRepository(
        cartManager: CartManager
    ): CartRepository {
        return CartRepository(cartManager)
    }
    
    @Provides
    @Singleton
    fun provideFavoritesRepository(
        apiService: ApiService,
        sessionManager: SessionManager
    ): FavoritesRepository {
        return FavoritesRepository(apiService, sessionManager)
    }
    
    @Provides
    @Singleton
    fun provideChatRepository(
        chatApiService: ChatApiService
    ): ChatRepository {
        return ChatRepository(chatApiService)
    }
} 