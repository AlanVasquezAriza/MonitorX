from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from users.permissions import IsAdmin

from .exceptions import OrderError
from .models import Order
from .serializers import OrderSerializer, OrderStatusUpdateSerializer
from .services import create_order_from_cart


class OrderListCreateView(generics.ListCreateAPIView):
    """
    GET: List the current user's orders (admin sees all).
    POST: Create an order from the current user's cart.
    """

    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = Order.objects.select_related("user").prefetch_related("items")
        if self.request.user.role == "ADMIN":
            return qs
        return qs.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        try:
            shipping_address = request.data.get("shipping_address", "")
            notes = request.data.get("notes", "")
            order = create_order_from_cart(request.user, shipping_address=shipping_address, notes=notes)
        except OrderError as exc:
            return Response(
                {"error": {"code": exc.code, "message": exc.message}},
                status=exc.http_status,
            )
        serializer = self.get_serializer(order)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class OrderDetailView(generics.RetrieveUpdateAPIView):
    """
    GET: Retrieve an order (owner or admin).
    PATCH: Update order status (admin only).
    """

    http_method_names = ["get", "patch", "head", "options"]

    def get_queryset(self):
        qs = Order.objects.select_related("user").prefetch_related("items")
        if self.request.user.role == "ADMIN":
            return qs
        return qs.filter(user=self.request.user)

    def get_serializer_class(self):
        if self.request.method == "PATCH":
            return OrderStatusUpdateSerializer
        return OrderSerializer

    def get_permissions(self):
        if self.request.method == "PATCH":
            return [IsAuthenticated(), IsAdmin()]
        return [IsAuthenticated()]
