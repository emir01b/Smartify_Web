#!/bin/bash

# HTML dosyalarını bul
HTML_FILES=$(find frontend -maxdepth 1 -name "*.html")

# Her HTML dosyası için değişiklik yap
for file in $HTML_FILES; do
  echo "Processing $file..."
  
  # CSS dosyasını ekle
  sed -i '' -e 's|<link rel="stylesheet" href="css/responsive.css">|<link rel="stylesheet" href="css/responsive.css">\n  <link rel="stylesheet" href="css/chatbot.css">|g' "$file"
  
  # JavaScript dosyasını ekle
  sed -i '' -e 's|</body>|  <script src="js/chatbot.js"></script>\n</body>|g' "$file"
done

echo "Done! Chatbot components added to all HTML files." 