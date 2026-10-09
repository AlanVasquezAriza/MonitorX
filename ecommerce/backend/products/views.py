from rest_framework import generics, filters
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from users.permissions import IsAdmin
from .models import Product
from .serializers import ProductSerializer
from .filters import ProductFilter


class ProductListCreateView(generics.ListCreateAPIView):
    """
    GET: List products with search, filters, ordering and pagination.
    POST: Create a product (admin only).
    """
    serializer_class = ProductSerializer
    filterset_class = ProductFilter

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ProductFilter
    search_fields = ["name", "description"]
    ordering_fields = ["price", "name", "created_at"]
    ordering = ["-created_at"]

    def get_queryset(self):
        return Product.objects.select_related("category").all()

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAuthenticated(), IsAdmin()]
        return [IsAuthenticated()]


class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET: Retrieve a product (any authenticated user).
    PUT/PATCH: Update a product (admin only).
    DELETE: Delete a product (admin only).
    """
    serializer_class = ProductSerializer

    def get_queryset(self):
        return Product.objects.select_related("category").all()

    def get_permissions(self):
        if self.request.method in ("PUT", "PATCH", "DELETE"):
            return [IsAuthenticated(), IsAdmin()]
        return [IsAuthenticated()]
