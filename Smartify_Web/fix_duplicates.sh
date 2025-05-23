#!/bin/bash

# HTML dosyalarını bul
HTML_FILES=$(find frontend -maxdepth 1 -name "*.html")

# Her HTML dosyası için manuel düzeltme yap
for file in $HTML_FILES; do
  echo "Fixing $file..."
  
  # Geçici dosya oluştur
  temp_file="${file}.temp"
  
  # Önce dosyayı oku ve bir geçici dosyaya yaz (chatbot.css ve chatbot.js sadece bir kez olacak şekilde)
  awk '
    BEGIN { css_count = 0; js_count = 0; }
    /chatbot\.css/ { 
      if (css_count == 0) { 
        print $0; 
        css_count++; 
      } 
      next;
    }
    /chatbot\.js/ { 
      if (js_count == 0) { 
        print $0; 
        js_count++; 
      } 
      next;
    }
    { print $0; }
  ' "$file" > "$temp_file"
  
  # Geçici dosyayı asıl dosya olarak taşı
  mv "$temp_file" "$file"
done

echo "Duplicated chatbot files removed from HTML files." 