from django.utils.text import slugify
from rest_framework import serializers
from categories.models import Category
from .models import Product


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    slug = serializers.SlugField(required=False, allow_blank=True)
    category = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        required=False,
        allow_null=True,
    )

    class Meta:
        model = Product
        fields = [
            "id", "name", "slug", "description", "price",
            "category", "category_name", "stock", "image", "is_active", "created_at",
        ]
        read_only_fields = ["id", "created_at"]

    def validate(self, attrs):
        if not attrs.get("slug") and attrs.get("name"):
            base_slug = slugify(attrs["name"]) or "product"
            slug = base_slug
            counter = 1
            instance_id = self.instance.pk if self.instance else None
            while Product.objects.filter(slug=slug).exclude(pk=instance_id).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            attrs["slug"] = slug
        return attrs

