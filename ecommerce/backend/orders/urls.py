from django.urls import path

from .views import OrderDetailView, OrderListCreateView

urlpatterns = [
    path("", OrderListCreateView.as_view(), name="order_list_create"),
    path("<int:pk>/", OrderDetailView.as_view(), name="order_detail"),
]
