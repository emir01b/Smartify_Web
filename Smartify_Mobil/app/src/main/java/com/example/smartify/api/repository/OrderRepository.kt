package com.example.smartify.api.repository

import com.example.smartify.api.ApiService
import com.example.smartify.api.models.Order
import com.example.smartify.utils.ApiResult
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import retrofit2.HttpException
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class OrderRepository @Inject constructor(
    private val apiService: ApiService
) {
    fun getMyOrders(): Flow<ApiResult<List<Order>>> = flow {
        emit(ApiResult.Loading())
        try {
            val response = apiService.getMyOrders()
            if (response.isSuccessful) {
                val orders = response.body() ?: emptyList()
                emit(ApiResult.Success(orders))
            } else {
                emit(ApiResult.Error("Siparişler getirilirken bir hata oluştu: ${response.message()}"))
            }
        } catch (e: HttpException) {
            emit(ApiResult.Error("Sunucu hatası: ${e.localizedMessage}"))
        } catch (e: Exception) {
            emit(ApiResult.Error("Bir hata oluştu: ${e.localizedMessage}"))
        }
    }
} 