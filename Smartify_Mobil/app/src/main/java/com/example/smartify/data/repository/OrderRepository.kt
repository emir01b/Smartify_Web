package com.example.smartify.data.repository

import com.example.smartify.api.ApiService
import com.example.smartify.api.models.Order
import com.example.smartify.utils.NetworkResult
import retrofit2.HttpException
import java.io.IOException
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class OrderRepository @Inject constructor(
    private val apiService: ApiService
) {
    // Uzak sunucudan siparişleri getir
    suspend fun fetchOrders(): NetworkResult<List<Order>> {
        return try {
            val response = apiService.getOrders()
            
            if (response.isSuccessful && response.body()?.success == true) {
                val orders = response.body()?.data
                
                if (orders != null) {
                    NetworkResult.Success(orders)
                } else {
                    NetworkResult.Error("Siparişler bulunamadı")
                }
            } else {
                NetworkResult.Error(response.body()?.message ?: "Siparişler getirilirken bir hata oluştu")
            }
        } catch (e: IOException) {
            NetworkResult.Error("İnternet bağlantınızı kontrol edin")
        } catch (e: HttpException) {
            NetworkResult.Error("Sunucu hatası: ${e.message}")
        } catch (e: Exception) {
            NetworkResult.Error("Bilinmeyen bir hata oluştu: ${e.message}")
        }
    }
    
    // Uzak sunucudan sipariş detayını getir
    suspend fun fetchOrderById(id: String): NetworkResult<Order> {
        return try {
            val response = apiService.getOrderById(id)
            
            if (response.isSuccessful && response.body()?.success == true) {
                val order = response.body()?.data
                
                if (order != null) {
                    NetworkResult.Success(order)
                } else {
                    NetworkResult.Error("Sipariş bulunamadı")
                }
            } else {
                NetworkResult.Error(response.body()?.message ?: "Sipariş getirilirken bir hata oluştu")
            }
        } catch (e: IOException) {
            NetworkResult.Error("İnternet bağlantınızı kontrol edin")
        } catch (e: HttpException) {
            NetworkResult.Error("Sunucu hatası: ${e.message}")
        } catch (e: Exception) {
            NetworkResult.Error("Bilinmeyen bir hata oluştu: ${e.message}")
        }
    }
    
    // Yeni sipariş oluştur
    suspend fun createOrder(order: Order): NetworkResult<Order> {
        return try {
            val response = apiService.createOrder(order)
            
            if (response.isSuccessful && response.body()?.success == true) {
                val createdOrder = response.body()?.data
                
                if (createdOrder != null) {
                    NetworkResult.Success(createdOrder)
                } else {
                    NetworkResult.Error("Sipariş oluşturulamadı")
                }
            } else {
                NetworkResult.Error(response.body()?.message ?: "Sipariş oluşturulurken bir hata oluştu")
            }
        } catch (e: IOException) {
            NetworkResult.Error("İnternet bağlantınızı kontrol edin")
        } catch (e: HttpException) {
            NetworkResult.Error("Sunucu hatası: ${e.message}")
        } catch (e: Exception) {
            NetworkResult.Error("Bilinmeyen bir hata oluştu: ${e.message}")
        }
    }
} 