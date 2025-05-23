# Smartify Web Uygulaması

## Chatbot API Kullanımı

Smartify Chatbot API'si, mobil ve diğer uygulamalarla entegrasyon için bir HTTP endpoint'i sağlar.

### Endpoint

```
POST /api/chatbot
```

### İstek Formatı

```json
{
  "message": "Kullanıcı mesajı buraya gelecek"
}
```

### Yanıt Formatı

Başarılı yanıt:

```json
{
  "response": "Chatbot'un yanıtı burada olacak"
}
```

Hata yanıtı:

```json
{
  "error": "Hata mesajı",
  "message": "Hata detayı",
  "details": "Ek hata bilgileri"
}
```

### Örnek Kullanım (JavaScript)

```javascript
// Chatbot API'ye istek gönderme
async function sendMessage(message) {
  try {
    const response = await fetch('https://api.smartify.com/api/chatbot', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message })
    });
    
    const data = await response.json();
    
    if (data.response) {
      console.log('Chatbot yanıtı:', data.response);
      return data.response;
    } else {
      throw new Error(data.error || 'Bilinmeyen hata');
    }
  } catch (error) {
    console.error('Hata:', error);
    throw error;
  }
}
```

### Mobil Uygulama Entegrasyonu

Mobil uygulamanızda `/frontend/js/mobileChatApi.js` dosyasını kullanarak Chatbot API'sine kolayca erişebilirsiniz. Bu modül, API ile iletişim kurmanız için gerekli tüm fonksiyonları sağlar.

Örnek kullanım:

```javascript
import { sendMessageToChatbot } from './mobileChatApi.js';

// Kullanıcı mesajını gönder ve yanıtı al
try {
  const botResponse = await sendMessageToChatbot("Merhaba, akıllı ev sistemleri hakkında bilgi alabilir miyim?");
  console.log("Chatbot yanıtı:", botResponse);
} catch (error) {
  console.error("Hata:", error);
} 