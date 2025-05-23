package com.example.smartify.api.models

import android.os.Parcelable
import com.google.gson.annotations.SerializedName
import kotlinx.parcelize.Parcelize

@Parcelize
data class FavoriteResponse(
    val message: String,
    val favorites: List<String>
) : Parcelable

// Eski WishlistProduct sınıfını siliyoruz 