from rest_framework import serializers
from .models import Product


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)

    class Meta:
        model = Product
        fields = [
            "id", "name", "slug", "description", "price",
            "category", "category_name", "stock", "image", "is_active", "created_at",
        ]
        read_only_fields = ["id", "created_at"]
