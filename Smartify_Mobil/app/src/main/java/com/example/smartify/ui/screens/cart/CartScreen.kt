package com.example.smartify.ui.screens.cart

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Remove
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Divider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import coil.request.ImageRequest

// Sepette gösterilecek örnek ürün modeli
data class CartItem(
    val id: String,
    val name: String,
    val price: Double,
    val imageUrl: String,
    val quantity: Int,
    val isInStock: Boolean = true
)

@Composable
fun CartScreen(
    onNavigateBack: () -> Unit,
    onNavigateToCheckout: () -> Unit
) {
    // Örnek sepet verileri
    val cartItems = remember {
        listOf(
            CartItem(
                id = "1",
                name = "Akıllı Ev Termostatı",
                price = 599.99,
                imageUrl = "https://example.com/thermostat.jpg",
                quantity = 1
            ),
            CartItem(
                id = "2",
                name = "Akıllı Ampul - 3'lü Paket",
                price = 199.99,
                imageUrl = "https://example.com/bulbs.jpg",
                quantity = 2
            ),
            CartItem(
                id = "3",
                name = "Kablosuz Güvenlik Kamerası",
                price = 799.99,
                imageUrl = "https://example.com/camera.jpg",
                quantity = 1,
                isInStock = false
            ),
        )
    }
    
    var items by remember { mutableStateOf(cartItems) }
    
    // Sepet özeti verileri
    val subtotal = items.sumOf { it.price * it.quantity }
    val shipping = if (subtotal > 0) 19.99 else 0.0
    val total = subtotal + shipping
    
    Surface(
        modifier = Modifier.fillMaxSize(),
        color = MaterialTheme.colorScheme.background
    ) {
        Column(
            modifier = Modifier.fillMaxSize()
        ) {
            // Başlık
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(onClick = onNavigateBack) {
                    Icon(
                        imageVector = Icons.Default.ArrowBack,
                        contentDescription = "Geri"
                    )
                }
                
                Text(
                    text = "Sepetim",
                    style = MaterialTheme.typography.headlineMedium,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(start = 8.dp)
                )
            }
            
            if (items.isEmpty()) {
                // Sepet boşsa
                EmptyCart(
                    modifier = Modifier
                        .fillMaxWidth()
                        .weight(1f)
                )
            } else {
                // Sepet içeriği
                LazyColumn(
                    modifier = Modifier
                        .fillMaxWidth()
                        .weight(1f)
                        .padding(horizontal = 16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(items) { item ->
                        CartItemCard(
                            cartItem = item,
                            onQuantityChanged = { _, _ -> /* İşlev henüz yok */ },
                            onRemoveItem = { _ -> /* İşlev henüz yok */ }
                        )
                    }
                    
                    item {
                        Spacer(modifier = Modifier.height(16.dp))
                    }
                }
            }
            
            // Sepet özeti
            CartSummary(
                subtotal = subtotal,
                shipping = shipping,
                total = total,
                onCheckout = onNavigateToCheckout,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp)
            )
        }
    }
}

@Composable
fun CartItemCard(
    cartItem: CartItem,
    onQuantityChanged: (String, Int) -> Unit,
    onRemoveItem: (String) -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Ürün resmi için yer tutucu
            Box(
                modifier = Modifier
                    .size(80.dp)
                    .clip(RoundedCornerShape(8.dp))
                    .background(MaterialTheme.colorScheme.surfaceVariant),
                contentAlignment = Alignment.Center
            ) {
                AsyncImage(
                    model = ImageRequest.Builder(LocalContext.current)
                        .data(cartItem.imageUrl)
                        .crossfade(true)
                        .build(),
                    contentDescription = cartItem.name,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier.fillMaxSize()
                )
            }
            
            Spacer(modifier = Modifier.width(12.dp))
            
            Column(
                modifier = Modifier.weight(1f)
            ) {
                Text(
                    text = cartItem.name,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis
                )
                
                Spacer(modifier = Modifier.height(4.dp))
                
                // Fiyat
                Row(
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "${cartItem.price} ₺",
                        style = MaterialTheme.typography.bodyLarge,
                        color = MaterialTheme.colorScheme.primary,
                        fontWeight = FontWeight.Bold
                    )
                    
                    if (!cartItem.isInStock) {
                        Spacer(modifier = Modifier.width(8.dp))
                        
                        Text(
                            text = "Stokta Yok",
                            color = MaterialTheme.colorScheme.error,
                            style = MaterialTheme.typography.bodySmall,
                            fontWeight = FontWeight.Medium
                        )
                    }
                }
                
                Spacer(modifier = Modifier.height(8.dp))
                
                // Adet ayarı
                Row(
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    IconButton(
                        onClick = { onQuantityChanged(cartItem.id, cartItem.quantity - 1) },
                        modifier = Modifier
                            .size(24.dp)
                            .clip(CircleShape)
                            .background(MaterialTheme.colorScheme.surfaceVariant),
                        enabled = cartItem.quantity > 1 && cartItem.isInStock
                    ) {
                        Icon(
                            imageVector = Icons.Default.Remove,
                            contentDescription = "Azalt",
                            modifier = Modifier.size(16.dp),
                            tint = if (cartItem.quantity > 1 && cartItem.isInStock) 
                                MaterialTheme.colorScheme.onSurfaceVariant 
                                else MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.5f)
                        )
                    }
                    
                    Text(
                        text = cartItem.quantity.toString(),
                        modifier = Modifier.padding(horizontal = 12.dp),
                        style = MaterialTheme.typography.bodyLarge
                    )
                    
                    IconButton(
                        onClick = { onQuantityChanged(cartItem.id, cartItem.quantity + 1) },
                        modifier = Modifier
                            .size(24.dp)
                            .clip(CircleShape)
                            .background(MaterialTheme.colorScheme.primary),
                        enabled = cartItem.isInStock
                    ) {
                        Icon(
                            imageVector = Icons.Default.Add,
                            contentDescription = "Arttır",
                            modifier = Modifier.size(16.dp),
                            tint = if (cartItem.isInStock) 
                                MaterialTheme.colorScheme.onPrimary 
                                else MaterialTheme.colorScheme.onPrimary.copy(alpha = 0.5f)
                        )
                    }
                }
            }
            
            IconButton(
                onClick = { onRemoveItem(cartItem.id) }
            ) {
                Icon(
                    imageVector = Icons.Default.Delete,
                    contentDescription = "Sil",
                    tint = MaterialTheme.colorScheme.error
                )
            }
        }
    }
}

@Composable
fun CartSummary(
    subtotal: Double,
    shipping: Double,
    total: Double,
    onCheckout: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(16.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Text(
                text = "Sipariş Özeti",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            // Ara toplam
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = "Ara toplam",
                    style = MaterialTheme.typography.bodyLarge,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                
                Text(
                    text = "${subtotal.format(2)} ₺",
                    style = MaterialTheme.typography.bodyLarge,
                    fontWeight = FontWeight.Medium
                )
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            
            // Kargo
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = "Kargo",
                    style = MaterialTheme.typography.bodyLarge,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                
                Text(
                    text = "${shipping.format(2)} ₺",
                    style = MaterialTheme.typography.bodyLarge,
                    fontWeight = FontWeight.Medium
                )
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            
            Divider()
            
            Spacer(modifier = Modifier.height(16.dp))
            
            // Toplam
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = "Toplam",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold
                )
                
                Text(
                    text = "${total.format(2)} ₺",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.primary
                )
            }
            
            Spacer(modifier = Modifier.height(24.dp))
            
            // Ödeme butonu
            Button(
                onClick = onCheckout,
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = MaterialTheme.colorScheme.primary
                ),
                enabled = total > 0
            ) {
                Text(
                    text = "ÖDEMEYE GEÇ",
                    modifier = Modifier.padding(vertical = 8.dp),
                    fontWeight = FontWeight.Bold
                )
            }
        }
    }
}

@Composable
fun EmptyCart(
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier,
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        // Boş sepet görseli
        Box(
            modifier = Modifier
                .size(120.dp)
                .clip(CircleShape)
                .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = Icons.Default.Close,
                contentDescription = "Boş Sepet",
                modifier = Modifier.size(48.dp),
                tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.7f)
            )
        }
        
        Spacer(modifier = Modifier.height(24.dp))
        
        Text(
            text = "Sepetiniz boş",
            style = MaterialTheme.typography.headlineSmall,
            fontWeight = FontWeight.Bold
        )
        
        Spacer(modifier = Modifier.height(8.dp))
        
        Text(
            text = "Sepetinize ürün ekleyerek alışverişe başlayabilirsiniz",
            style = MaterialTheme.typography.bodyLarge,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.padding(horizontal = 48.dp),
            textAlign = androidx.compose.ui.text.style.TextAlign.Center
        )
        
        Spacer(modifier = Modifier.height(32.dp))
        
        OutlinedButton(
            onClick = { /* İşlev henüz yok */ },
            modifier = Modifier.padding(horizontal = 32.dp),
            shape = RoundedCornerShape(12.dp)
        ) {
            Text(
                text = "ALIŞVERİŞE BAŞLA",
                modifier = Modifier.padding(vertical = 6.dp, horizontal = 16.dp),
                fontWeight = FontWeight.Bold
            )
        }
    }
}

// Double formatlama uzantısı
fun Double.format(digits: Int): String {
    return "%.${digits}f".format(this)
} 