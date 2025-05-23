/**
 * Smartify Chatbot API - Mobil uygulama için yardımcı fonksiyonlar
 */

/**
 * Chatbot API'sine mesaj gönderip yanıt alan fonksiyon
 * @param {string} message - Kullanıcı mesajı
 * @returns {Promise<string>} - Chatbot yanıtı
 */
async function sendMessageToChatbot(message) {
  try {
    // API URL'ini projenize göre değiştirin
    const apiUrl = 'https://api.smartify.com/api/chatbot'; // Gerçek URL'inizi kullanın
    
    // API'ye istek gönder
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message })
    });
    
    // Yanıt JSON değilse hata fırlat
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Hatası: ${response.status} - ${errorText}`);
    }
    
    // Yanıtı JSON olarak parse et
    const data = await response.json();
    
    // Chatbot yanıtını döndür
    if (data && data.response) {
      return data.response;
    } else {
      throw new Error('Geçersiz API yanıtı');
    }
  } catch (error) {
    console.error('Chatbot API Hatası:', error);
    throw error;
  }
}

/**
 * Chatbot oturumunu başlatan fonksiyon - gerekirse oturum kimliği/token almak için kullanılabilir
 * @returns {Promise<Object>} - Oturum bilgisi
 */
async function initChatbotSession() {
  // Bu örnek şu anda oturum başlatma gerektirmez
  // Ancak ileride token tabanlı bir sistem eklerseniz bunu kullanabilirsiniz
  return {
    initialized: true,
    timestamp: new Date().toISOString()
  };
}

// Dışa aktarılan fonksiyonlar
export {
  sendMessageToChatbot,
  initChatbotSession
}; 