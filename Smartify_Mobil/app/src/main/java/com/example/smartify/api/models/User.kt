package com.example.smartify.api.models

import android.os.Parcelable
import com.google.gson.annotations.SerializedName
import kotlinx.parcelize.Parcelize

@Parcelize
data class User(
    @SerializedName("_id")
    val id: String,
    val name: String,
    val email: String,
    val phone: String? = null,
    val address: Address? = null,
    val isAdmin: Boolean = false,
    val createdAt: String,
    val updatedAt: String? = null
) : Parcelable

@Parcelize
data class Address(
    val street: String = "",
    val city: String = "",
    val postalCode: String = "",
    val country: String = ""
) : Parcelable 