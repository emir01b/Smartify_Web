package com.example.smartify.api.models

import android.os.Parcelable
import kotlinx.parcelize.Parcelize
import java.util.Date

@Parcelize
data class ChatMessage(
    val id: String = System.currentTimeMillis().toString(),
    val content: String,
    val role: String,
    val timestamp: Long = System.currentTimeMillis()
) : Parcelable

data class ChatbotRequest(
    val message: String
)

data class ChatbotResponse(
    val response: String? = null,
    val error: String? = null,
    val message: String? = null,
    val details: ErrorDetails? = null
)

data class ErrorDetails(
    val error: String? = null
) 