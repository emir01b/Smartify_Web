package com.example.smartify.api

import com.example.smartify.api.models.ChatbotRequest
import com.example.smartify.api.models.ChatbotResponse
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.POST

interface ChatApiService {
    @POST("api/chatbot")
    suspend fun getChatbotResponse(
        @Body request: ChatbotRequest
    ): Response<ChatbotResponse>
} 