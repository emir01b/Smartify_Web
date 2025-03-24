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
    val createdAt: String
) : Parcelable

@Parcelize
data class Address(
    val street: String,
    val city: String,
    val state: String,
    val zipCode: String,
    val country: String
) : Parcelable 