package com.example.smartify.api.models

data class AuthResponse(
    val token: String,
    val user: User,
    val success: Boolean,
    val message: String? = null
) 