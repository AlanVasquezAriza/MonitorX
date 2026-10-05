from django.urls import path
from .views import CartView, AddToCartView, UpdateCartItemView, RemoveCartItemView

urlpatterns = [
    path("", CartView.as_view(), name="cart_detail"),
    path("add/", AddToCartView.as_view(), name="cart_add"),
    path("items/<int:pk>/", UpdateCartItemView.as_view(), name="cart_item_update"),
    path("items/<int:pk>/remove/", RemoveCartItemView.as_view(), name="cart_item_remove"),
]
