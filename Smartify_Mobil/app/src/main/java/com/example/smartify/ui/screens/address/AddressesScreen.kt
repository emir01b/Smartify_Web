package com.example.smartify.ui.screens.address

import android.util.Log
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardCapitalization
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.example.smartify.api.models.Address

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddressesScreen(
    onNavigateBack: () -> Unit,
    viewModel: AddressViewModel = hiltViewModel()
) {
    val addressState by viewModel.addressState.collectAsState()
    val isLoggedIn by viewModel.isLoggedIn.collectAsState()
    val updateState by viewModel.updateState.collectAsState()

    val snackbarHostState = remember { SnackbarHostState() }
    
    LaunchedEffect(key1 = isLoggedIn) {
        Log.d("AddressesScreen", "Oturum durumu değişti: $isLoggedIn")
        if (!isLoggedIn) {
            Log.d("AddressesScreen", "Oturum açık değil, geri yönlendiriliyor")
            onNavigateBack()
        }
    }
    
    // Güncelleme durumuna göre snackbar göster
    LaunchedEffect(key1 = updateState) {
        when (updateState) {
            is UpdateState.Success -> {
                snackbarHostState.showSnackbar((updateState as UpdateState.Success).message)
            }
            is UpdateState.Error -> {
                snackbarHostState.showSnackbar((updateState as UpdateState.Error).message)
            }
            else -> {}
        }
    }
    
    Scaffold(
        snackbarHost = { SnackbarHost(snackbarHostState) },
        topBar = {
            TopAppBar(
                title = { Text("Adreslerim") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Geri"
                        )
                    }
                }
            )
        }
    ) { padding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            when (addressState) {
                is AddressState.Loading -> {
                    CircularProgressIndicator(modifier = Modifier.align(Alignment.Center))
                }
                is AddressState.Success -> {
                    val user = (addressState as AddressState.Success).user
                    AddressContent(
                        address = user.address,
                        isUpdating = updateState is UpdateState.Loading,
                        onAddressUpdate = { address ->
                            viewModel.updateAddress(address)
                        }
                    )
                }
                is AddressState.Error -> {
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(16.dp),
                        verticalArrangement = Arrangement.Center,
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = (addressState as AddressState.Error).message,
                            style = MaterialTheme.typography.bodyLarge,
                            textAlign = TextAlign.Center
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun AddressContent(
    address: Address?,
    isUpdating: Boolean,
    onAddressUpdate: (Address) -> Unit
) {
    var street by rememberSaveable { mutableStateOf(address?.street ?: "") }
    var city by rememberSaveable { mutableStateOf(address?.city ?: "") }
    var postalCode by rememberSaveable { mutableStateOf(address?.postalCode ?: "") }
    var country by rememberSaveable { mutableStateOf(address?.country ?: "") }
    
    // Adres nesnesi değiştiğinde form alanlarını güncelle
    LaunchedEffect(key1 = address) {
        street = address?.street ?: ""
        city = address?.city ?: ""
        postalCode = address?.postalCode ?: ""
        country = address?.country ?: ""
    }
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp)
    ) {
        // Başlık
        Text(
            text = "Teslimat Adresi",
            style = MaterialTheme.typography.headlineSmall,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(bottom = 24.dp)
        )
        
        // Adres Kartı
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp)
            ) {
                // Sokak / Cadde
                OutlinedTextField(
                    value = street,
                    onValueChange = { street = it },
                    label = { Text("Sokak / Cadde") },
                    modifier = Modifier.fillMaxWidth(),
                    leadingIcon = {
                        Icon(
                            imageVector = Icons.Default.LocationOn,
                            contentDescription = null
                        )
                    },
                    keyboardOptions = KeyboardOptions(
                        capitalization = KeyboardCapitalization.Words
                    )
                )
                
                Spacer(modifier = Modifier.height(16.dp))
                
                // Şehir
                OutlinedTextField(
                    value = city,
                    onValueChange = { city = it },
                    label = { Text("Şehir") },
                    modifier = Modifier.fillMaxWidth(),
                    keyboardOptions = KeyboardOptions(
                        capitalization = KeyboardCapitalization.Words
                    )
                )
                
                Spacer(modifier = Modifier.height(16.dp))
                
                // Posta Kodu
                OutlinedTextField(
                    value = postalCode,
                    onValueChange = { postalCode = it },
                    label = { Text("Posta Kodu") },
                    modifier = Modifier.fillMaxWidth(),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
                )
                
                Spacer(modifier = Modifier.height(16.dp))
                
                // Ülke
                OutlinedTextField(
                    value = country,
                    onValueChange = { country = it },
                    label = { Text("Ülke") },
                    modifier = Modifier.fillMaxWidth(),
                    keyboardOptions = KeyboardOptions(
                        capitalization = KeyboardCapitalization.Words
                    )
                )
            }
        }
        
        Spacer(modifier = Modifier.height(32.dp))
        
        // Kaydet Butonu
        Button(
            onClick = {
                val updatedAddress = Address(
                    street = street.trim(),
                    city = city.trim(),
                    postalCode = postalCode.trim(),
                    country = country.trim()
                )
                onAddressUpdate(updatedAddress)
            },
            enabled = !isUpdating && 
                     street.isNotBlank() && 
                     city.isNotBlank() && 
                     postalCode.isNotBlank() && 
                     country.isNotBlank(),
            modifier = Modifier.fillMaxWidth()
        ) {
            if (isUpdating) {
                CircularProgressIndicator(
                    modifier = Modifier
                        .padding(end = 8.dp)
                        .height(24.dp),
                    strokeWidth = 2.dp
                )
            }
            Text(text = if (isUpdating) "Kaydediliyor..." else "Kaydet")
        }
        
        Spacer(modifier = Modifier.height(24.dp))
    }
} 