// API URL'si
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent';
let GEMINI_API_KEY = '';

// Sohbet geçmişi
let chatHistory = [];

// API anahtarını al
const getApiKey = async () => {
  try {
    console.log('API anahtarı alınıyor...');
    const response = await fetch('/api/config');
    const data = await response.json();
    GEMINI_API_KEY = data.geminiApiKey;
    console.log('API anahtarı alındı:', GEMINI_API_KEY ? 'Başarılı' : 'Boş');
    return true;
  } catch (error) {
    console.error('API anahtarı alınamadı:', error);
    return false;
  }
};

// Sohbet balonunu oluştur
const createChatBubble = () => {
  console.log('Sohbet balonu oluşturuluyor...');
  
  // Eğer zaten varsa, tekrar oluşturma
  if (document.querySelector('.ai-chat-bubble')) {
    console.log('Sohbet balonu zaten var');
    return;
  }

  const bubble = document.createElement('div');
  bubble.className = 'ai-chat-bubble';
  bubble.style.zIndex = '9999';
  bubble.innerHTML = '<i class="fas fa-robot"></i>';
  document.body.appendChild(bubble);

  const chatContainer = document.createElement('div');
  chatContainer.className = 'ai-chat-container';
  chatContainer.style.zIndex = '9999';
  chatContainer.innerHTML = `
    <div class="ai-chat-header">
      <h3>3D DDD AI Asistan</h3>
      <button class="ai-chat-close"><i class="fas fa-times"></i></button>
    </div>
    <div class="ai-chat-messages"></div>
    <div class="ai-chat-input">
      <textarea placeholder="Mesajınızı yazın..."></textarea>
      <button class="ai-chat-send"><i class="fas fa-paper-plane"></i></button>
    </div>
  `;
  document.body.appendChild(chatContainer);

  console.log('Sohbet balonu oluşturuldu');

  // Event listeners
  bubble.addEventListener('click', () => {
    chatContainer.classList.toggle('active');
    bubble.classList.toggle('hidden');
  });

  chatContainer.querySelector('.ai-chat-close').addEventListener('click', () => {
    chatContainer.classList.remove('active');
    bubble.classList.remove('hidden');
  });

  const sendButton = chatContainer.querySelector('.ai-chat-send');
  const textarea = chatContainer.querySelector('textarea');

  const sendMessage = async () => {
    const message = textarea.value.trim();
    if (!message) return;

    // Kullanıcı mesajını göster
    addMessage('user', message);
    textarea.value = '';

    try {
      // AI yanıtını al
      const response = await getAIResponse(message);
      addMessage('ai', response);
    } catch (error) {
      console.error('AI yanıtı alınamadı:', error);
      addMessage('ai', 'Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  sendButton.addEventListener('click', sendMessage);
  textarea.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
};

// Mesaj ekle
const addMessage = (sender, text) => {
  const messagesContainer = document.querySelector('.ai-chat-messages');
  const messageDiv = document.createElement('div');
  messageDiv.className = `ai-chat-message ${sender}-message`;
  
  const content = document.createElement('div');
  content.className = 'message-content';
  content.textContent = text;
  
  messageDiv.appendChild(content);
  messagesContainer.appendChild(messageDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;

  // Sohbet geçmişine ekle
  chatHistory.push({ role: sender, content: text });
};

// AI yanıtı al
const getAIResponse = async (message) => {
  try {
    const response = await fetch(GEMINI_API_URL + '?key=' + GEMINI_API_KEY, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: message
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      })
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message || 'API hatası');
    }

    if (!data.candidates || !data.candidates[0]) {
      throw new Error('AI yanıt vermedi');
    }

    return data.candidates[0].content.parts[0].text || 'Üzgünüm, bir yanıt oluşturamadım.';
  } catch (error) {
    console.error('AI API hatası:', error);
    throw error;
  }
};

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', async () => {
  console.log('Sayfa yüklendi, AI sohbet başlatılıyor...');
  const apiKeySuccess = await getApiKey();
  if (apiKeySuccess) {
    createChatBubble();
  } else {
    console.error('API anahtarı alınamadığı için sohbet balonu oluşturulamadı');
  }
}); 