package com.example.smartify.ui.orders

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.smartify.api.models.Order
import com.example.smartify.api.repository.OrderRepository
import com.example.smartify.utils.ApiResult
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class OrdersViewModel @Inject constructor(
    private val orderRepository: OrderRepository
) : ViewModel() {

    private val _ordersState = MutableStateFlow<OrdersState>(OrdersState.Initial)
    val ordersState: StateFlow<OrdersState> = _ordersState.asStateFlow()

    init {
        getMyOrders()
    }

    fun getMyOrders() {
        viewModelScope.launch {
            _ordersState.value = OrdersState.Loading
            orderRepository.getMyOrders().collectLatest { result ->
                when (result) {
                    is ApiResult.Success -> {
                        if (result.data.isNullOrEmpty()) {
                            _ordersState.value = OrdersState.Empty
                        } else {
                            _ordersState.value = OrdersState.Success(result.data)
                        }
                    }
                    is ApiResult.Error -> {
                        _ordersState.value = OrdersState.Error(result.message ?: "Bilinmeyen bir hata oluştu")
                    }
                    is ApiResult.Loading -> {
                        _ordersState.value = OrdersState.Loading
                    }
                }
            }
        }
    }
}

sealed class OrdersState {
    object Initial : OrdersState()
    object Loading : OrdersState()
    object Empty : OrdersState()
    data class Success(val orders: List<Order>) : OrdersState()
    data class Error(val message: String) : OrdersState()
} 