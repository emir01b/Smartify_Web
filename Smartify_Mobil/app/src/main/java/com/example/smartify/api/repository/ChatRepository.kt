package com.example.smartify.api.repository

import android.util.Log
import com.example.smartify.api.ChatApiService
import com.example.smartify.api.models.ChatMessage
import com.example.smartify.api.models.ChatbotRequest
import com.example.smartify.utils.NetworkResult
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.IOException
import java.net.UnknownHostException
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ChatRepository @Inject constructor(
    private val chatApiService: ChatApiService
) {
    companion object {
        private const val TAG = "ChatRepository"
    }
    
    suspend fun sendMessage(userMessage: String): NetworkResult<ChatMessage> {
        return withContext(Dispatchers.IO) {
            try {
                Log.d(TAG, "Sending message to chatbot API: $userMessage")
                
                // Yeni API için request oluştur
                val request = ChatbotRequest(message = userMessage)
                
                // API çağrısını yap
                val response = chatApiService.getChatbotResponse(request)
                
                if (response.isSuccessful && response.body() != null) {
                    val responseBody = response.body()!!
                    
                    // Başarılı yanıt kontrolü
                    if (responseBody.response != null) {
                        val chatMessage = ChatMessage(
                            content = responseBody.response,
                            role = "assistant"
                        )
                        Log.d(TAG, "Received response from chatbot API: ${chatMessage.content}")
                        return@withContext NetworkResult.Success(chatMessage)
                    } else if (responseBody.error != null) {
                        // API hata durumu
                        val errorMessage = responseBody.error ?: responseBody.message ?: "Bilinmeyen bir hata oluştu"
                        Log.e(TAG, "Error in chatbot API response: $errorMessage")
                        return@withContext NetworkResult.Error(errorMessage)
                    } else {
                        Log.e(TAG, "API response has no content")
                        return@withContext NetworkResult.Error("API yanıtı boş")
                    }
                } else {
                    val errorMessage = response.errorBody()?.string() ?: "Bilinmeyen bir hata oluştu"
                    Log.e(TAG, "Error in chatbot API response: $errorMessage")
                    return@withContext NetworkResult.Error(errorMessage)
                }
            } catch (e: UnknownHostException) {
                // DNS çözümleme hatası
                Log.e(TAG, "DNS çözümleme hatası: ${e.message}", e)
                return@withContext NetworkResult.Error("İnternet bağlantısı yok veya DNS sorunu: ${e.message}")
            } catch (e: IOException) {
                // Ağ hatası
                Log.e(TAG, "Ağ hatası: ${e.message}", e)
                return@withContext NetworkResult.Error("Ağ hatası: İnternet bağlantınızı kontrol edin")
            } catch (e: Exception) {
                Log.e(TAG, "Exception during chatbot API call", e)
                return@withContext NetworkResult.Error(e.message ?: "Bilinmeyen bir hata oluştu")
            }
        }
    }
} 