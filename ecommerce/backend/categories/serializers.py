from django.utils.text import slugify
from rest_framework import serializers
from .models import Category


class CategorySerializer(serializers.ModelSerializer):
    slug = serializers.SlugField(required=False, allow_blank=True)

    class Meta:
        model = Category
        fields = ["id", "name", "slug", "description", "is_active", "created_at"]
        read_only_fields = ["id", "created_at"]

    def validate(self, attrs):
        if not attrs.get("slug") and attrs.get("name"):
            base_slug = slugify(attrs["name"]) or "category"
            slug = base_slug
            counter = 1
            instance_id = self.instance.pk if self.instance else None
            while Category.objects.filter(slug=slug).exclude(pk=instance_id).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            attrs["slug"] = slug
        return attrs

