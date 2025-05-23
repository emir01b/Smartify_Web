package com.example.smartify.ui.chat

import android.content.Context
import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.smartify.api.models.ChatMessage
import com.example.smartify.api.repository.ChatRepository
import com.example.smartify.utils.NetworkResult
import com.example.smartify.utils.NetworkUtils
import dagger.hilt.android.lifecycle.HiltViewModel
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.util.UUID
import javax.inject.Inject

@HiltViewModel
class ChatViewModel @Inject constructor(
    private val chatRepository: ChatRepository,
    @ApplicationContext private val context: Context
) : ViewModel() {
    private val _chatState = MutableStateFlow<ChatState>(ChatState.Initial)
    val chatState: StateFlow<ChatState> = _chatState.asStateFlow()
    
    private val _messages = MutableStateFlow<List<ChatMessage>>(emptyList())
    val messages: StateFlow<List<ChatMessage>> = _messages.asStateFlow()
    
    private val _isChatOpen = MutableStateFlow(false)
    val isChatOpen: StateFlow<Boolean> = _isChatOpen.asStateFlow()
    
    private val _networkError = MutableStateFlow(false)
    val networkError: StateFlow<Boolean> = _networkError.asStateFlow()

    companion object {
        private const val TAG = "ChatViewModel"
    }
    
    fun toggleChat() {
        _isChatOpen.value = !_isChatOpen.value
        
        // Chat açıldığında ve hiç mesaj yoksa hoşgeldin mesajını göster
        if (_isChatOpen.value && _messages.value.isEmpty()) {
            viewModelScope.launch {
                val welcomeMessage = ChatMessage(
                    id = UUID.randomUUID().toString(),
                    content = "Merhaba! Smartify'a hoş geldiniz. Size nasıl yardımcı olabilirim?",
                    role = "assistant"
                )
                _messages.value = listOf(welcomeMessage)
            }
        }
    }

    fun sendMessage(message: String) {
        if (message.isBlank()) return
        
        // İnternet bağlantısını kontrol et
        if (!NetworkUtils.isNetworkAvailable(context)) {
            _networkError.value = true
            _chatState.value = ChatState.Error("İnternet bağlantısı bulunamadı. Lütfen bağlantınızı kontrol edin.")
            return
        } else {
            _networkError.value = false
        }
        
        // UI'da kullanıcı mesajını hemen göster
        val userMessage = ChatMessage(
            id = UUID.randomUUID().toString(),
            content = message,
            role = "user"
        )
        
        _messages.value = _messages.value + userMessage
        _chatState.value = ChatState.Loading
        
        // API'ye mesajı gönder
        viewModelScope.launch {
            try {
                Log.d(TAG, "Sending message to repository: $message")
                
                when (val response = chatRepository.sendMessage(message)) {
                    is NetworkResult.Success -> {
                        val botMessage = response.data
                        _messages.value = _messages.value + botMessage
                        _chatState.value = ChatState.Success
                        Log.d(TAG, "Received message from bot: ${botMessage.content}")
                    }
                    is NetworkResult.Error -> {
                        Log.e(TAG, "Error sending message: ${response.message}")
                        _chatState.value = ChatState.Error(response.message ?: "Bilinmeyen bir hata oluştu")
                    }
                    NetworkResult.Loading -> {
                        _chatState.value = ChatState.Loading
                    }
                }
            } catch (e: Exception) {
                Log.e(TAG, "Exception while sending message", e)
                _chatState.value = ChatState.Error(e.message ?: "Bilinmeyen bir hata oluştu")
            }
        }
    }
    
    fun clearChat() {
        _messages.value = emptyList()
        _chatState.value = ChatState.Initial
        _networkError.value = false
    }
}

sealed class ChatState {
    object Initial : ChatState()
    object Loading : ChatState()
    object Success : ChatState()
    data class Error(val message: String) : ChatState()
} 