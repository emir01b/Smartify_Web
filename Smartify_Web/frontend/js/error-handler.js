// Konsol hatalarını bastırmak için
(function() {
    // Orijinal console.error fonksiyonunu saklayalım
    const originalConsoleError = console.error;
    
    // Resim yükleme hatalarını filtrelemek için console.error'u override edelim
    console.error = function() {
        // Argümanları kontrol et
        for (let i = 0; i < arguments.length; i++) {
            const arg = arguments[i];
            
            // Eğer bu bir resim yükleme hatası ise, gösterme
            if (typeof arg === 'string' && 
                (arg.includes('Failed to load resource') || 
                 arg.includes('404 (Not Found)') || 
                 arg.includes('.jpg') || 
                 arg.includes('.png') || 
                 arg.includes('.gif'))) {
                return; // Hata mesajını gösterme
            }
        }
        
        // Diğer hata mesajlarını normal şekilde göster
        return originalConsoleError.apply(console, arguments);
    };
})(); 