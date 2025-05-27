// Chatbot işlevselliği için JavaScript
document.addEventListener('DOMContentLoaded', function() {
  // Chat bot HTML'ini oluştur
  const chatbotHTML = `
    <div class="chatbot-container" id="chatbot-container">
      <div class="chatbot-toggle" id="chatbot-toggle">
        <i class="fas fa-comments"></i>
      </div>
      <div class="chatbot-box" id="chatbot-box">
        <div class="chatbot-header">
          <h3>Smartify Asistan</h3>
          <button class="close-btn" id="close-chat"><i class="fas fa-times"></i></button>
        </div>
        <div class="chatbot-messages" id="chatbot-messages">
          <div class="bot-message">
            <div class="bot-avatar">
              <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
              Merhaba! Ben Smartify Asistan. Size nasıl yardımcı olabilirim?
            </div>
          </div>
        </div>
        <div class="chatbot-input">
          <input type="text" id="user-input" placeholder="Mesajınızı yazın...">
          <button id="send-button"><i class="fas fa-paper-plane"></i></button>
        </div>
      </div>
    </div>
  `;

  // Chatbot HTML'ini body'nin sonuna ekle
  document.body.insertAdjacentHTML('beforeend', chatbotHTML);

  // Chatbot elemanlarını seç
  const chatbotToggle = document.getElementById('chatbot-toggle');
  const chatbotBox = document.getElementById('chatbot-box');
  const closeChat = document.getElementById('close-chat');
  const chatMessages = document.getElementById('chatbot-messages');
  const userInput = document.getElementById('user-input');
  const sendButton = document.getElementById('send-button');

  // API anahtarı - OpenRouter panelinden güncel API anahtarını buraya ekleyin
  // Geçersiz API anahtarı 401 hatasına sebep oluyor
  const apiKey = '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';
  
  // Model adı
  const modelName = 'google/gemma-3n-e4b-it:free';

  // Chatbot'u göster/gizle
  chatbotToggle.addEventListener('click', function() {
    chatbotBox.classList.toggle('active');
    chatbotToggle.classList.toggle('hidden');
  });

  // Chatbot'u kapat
  closeChat.addEventListener('click', function() {
    chatbotBox.classList.remove('active');
    chatbotToggle.classList.remove('hidden');
  });

  // Mesaj gönderme fonksiyonu
  function sendMessage() {
    const message = userInput.value.trim();
    if (message) {
      // Kullanıcı mesajını ekrana ekle
      addMessage(message, 'user');
      // Input alanını temizle
      userInput.value = '';
      // Yapay zeka yanıtını al
      getBotResponse(message);
    }
  }

  // Mesajı ekrana ekle
  function addMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = type === 'user' ? 'user-message' : 'bot-message';
    
    let messageHTML = '';
    
    if (type === 'user') {
      messageHTML = `
        <div class="user-avatar">
          <i class="fas fa-user"></i>
        </div>
        <div class="message-content">
          ${message}
        </div>
      `;
    } else {
      messageHTML = `
        <div class="bot-avatar">
          <i class="fas fa-robot"></i>
        </div>
        <div class="message-content">
          ${message}
        </div>
      `;
    }
    
    messageDiv.innerHTML = messageHTML;
    chatMessages.appendChild(messageDiv);
    
    // Otomatik scroll
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Düşünüyor animasyonu ekle
  function addThinkingAnimation() {
    const thinkingDiv = document.createElement('div');
    thinkingDiv.className = 'bot-message thinking';
    thinkingDiv.id = 'thinking-animation';
    
    const thinkingHTML = `
      <div class="bot-avatar">
        <i class="fas fa-robot"></i>
      </div>
      <div class="message-content">
        <div class="thinking-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    `;
    
    thinkingDiv.innerHTML = thinkingHTML;
    chatMessages.appendChild(thinkingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Düşünüyor animasyonunu kaldır
  function removeThinkingAnimation() {
    const thinkingDiv = document.getElementById('thinking-animation');
    if (thinkingDiv) {
      thinkingDiv.remove();
    }
  }

  // Hata mesajını konsola yazdır ve ekranda göster
  function handleError(error) {
    console.error('Chatbot Error:', error);
    removeThinkingAnimation();
    addMessage(`Bir hata oluştu: ${error.message}. Lütfen daha sonra tekrar deneyin.`, 'bot');
  }

  // OpenRouter API'yi kullanarak yanıt al
  async function getBotResponse(message) {
    // Düşünüyor animasyonu göster
    addThinkingAnimation();

    try {
      // İstek parametreleri - System mesajı yerine doğrudan kullanıcı mesajı kullanılacak
      const requestPayload = {
        model: modelName,
        messages: [
          {
            role: 'user',
            content: `Sen Smartify teknoloji mağazasının yardımcı asistanısın. Aşağıdaki bilgileri kullanarak müşterilere yardımcı ol. Yanıtların kısa, öz ve Türkçe olmalı.

MAĞAZA BİLGİSİ:
- Smartify, 2020 yılından beri hizmet veren bir teknoloji mağazasıdır
- Akıllı Ev Sistemleri, elektronik komponentler ve maker ekipmanları satıyoruz
- Deneyimli ekibimiz ve geniş ürün yelpazemizle hem hobi amaçlı hem de profesyonel kullanıcılara hitap ediyoruz
- 7/24 teknik destek sunuyoruz

ÜRÜN KATEGORİLERİ:
1. Akıllı Ev Sistemleri: Smart Home, IoT cihazları, zil sistemleri, kamera sistemleri
2. Elektronik Komponentler: Arduino, Raspberry Pi, sensörler, motorlar, LED'ler
3. Maker Ekipmanları: Lehimleme istasyonları, el aletleri, ölçüm cihazları

TESLİMAT VE ÖDEME:
- Siparişler aynı gün kargoya verilir
- Tüm ödeme işlemleri SSL sertifikası ile güvence altındadır
- Kapıda ödeme, kredi kartı ve havale/EFT seçenekleri mevcuttur

İADE POLİTİKASI:
- 14 gün içerisinde koşulsuz iade garantisi
- Ürünün kullanılmamış ve orijinal paketinde olması gerekir
- İade kargo ücreti müşteriye aittir (üretim hatası hariç)

İLETİŞİM BİLGİLERİ:
- E-posta: info@smartify.com
- Telefon: 0212 555 1234
- Adres: Teknoloji Caddesi No:42, İstanbul

Kullanıcı mesajı: ${message}`
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      };
      
      console.log('API Request:', JSON.stringify(requestPayload, null, 2));
      
      // API'ye istek gönder
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Smartify Asistan'
        },
        body: JSON.stringify(requestPayload)
      });

      // İstek yanıtını ham metin olarak al (hata ayıklama için)
      const responseText = await response.text();
      console.log('API Raw Response:', responseText);
      
      // Yanıt başarılı değilse hata fırlat
      if (!response.ok) {
        try {
          // Yanıtı JSON olarak parse etmeye çalış
          const errorData = JSON.parse(responseText);
          console.error('API Error:', response.status, errorData);
          throw new Error(`API Hatası: ${response.status} - ${errorData.error?.message || 'Bilinmeyen hata'}`);
        } catch (jsonError) {
          // JSON parse hatası
          console.error('API Error (parse failed):', response.status, responseText);
          throw new Error(`API Hatası: ${response.status} - Yanıt ayrıştırılamadı`);
        }
      }
      
      try {
        // Yanıtı JSON olarak parse et
        const data = JSON.parse(responseText);
        console.log('API Response Data:', data);
        
        // Düşünüyor animasyonunu kaldır
        removeThinkingAnimation();
        
        if (data.choices && data.choices.length > 0) {
          const botResponse = data.choices[0].message.content;
          addMessage(botResponse, 'bot');
        } else {
          addMessage('Üzgünüm, şu anda yanıt veremiyorum. Lütfen daha sonra tekrar deneyin.', 'bot');
        }
      } catch (jsonError) {
        console.error('Response parsing error:', jsonError);
        throw new Error('Yanıt işlenirken bir hata oluştu');
      }
    } catch (error) {
      handleError(error);
    }
  }

  // Enter tuşuna basınca mesaj gönderme
  userInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
      sendMessage();
    }
  });

  // Gönder butonuna tıklayınca mesaj gönderme
  sendButton.addEventListener('click', sendMessage);
}); 