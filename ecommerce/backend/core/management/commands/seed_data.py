import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction

from categories.models import Category
from products.models import Product


CATEGORIES = [
    {
        "name": "Electronics",
        "slug": "electronics",
        "description": "Devices and accessories.",
    },
    {
        "name": "Home & Kitchen",
        "slug": "home-kitchen",
        "description": "Useful items for home and kitchen.",
    },
    {
        "name": "Books",
        "slug": "books",
        "description": "Books for learning and entertainment.",
    },
    {
        "name": "Clothing",
        "slug": "clothing",
        "description": "Everyday clothing and accessories.",
    },
]

PRODUCTS = [
    {
        "name": "Wireless Headphones",
        "slug": "wireless-headphones",
        "description": "Over-ear wireless headphones with a built-in microphone.",
        "price": "79.99",
        "category": "electronics",
        "stock": 25,
    },
    {
        "name": "USB-C Charger",
        "slug": "usb-c-charger",
        "description": "Compact 30W USB-C wall charger.",
        "price": "24.50",
        "category": "electronics",
        "stock": 60,
    },
    {
        "name": "Insulated Water Bottle",
        "slug": "insulated-water-bottle",
        "description": "Reusable stainless steel water bottle.",
        "price": "18.00",
        "category": "home-kitchen",
        "stock": 40,
    },
    {
        "name": "Cotton Towel Set",
        "slug": "cotton-towel-set",
        "description": "A soft set of two everyday cotton towels.",
        "price": "32.00",
        "category": "home-kitchen",
        "stock": 18,
    },
    {
        "name": "Everyday Cooking",
        "slug": "everyday-cooking",
        "description": "A practical introduction to home cooking.",
        "price": "21.95",
        "category": "books",
        "stock": 12,
    },
    {
        "name": "The Quiet Garden",
        "slug": "the-quiet-garden",
        "description": "A sample paperback for readers and gardeners.",
        "price": "16.75",
        "category": "books",
        "stock": 9,
    },
    {
        "name": "Classic Cotton T-Shirt",
        "slug": "classic-cotton-t-shirt",
        "description": "A comfortable everyday cotton T-shirt.",
        "price": "19.99",
        "category": "clothing",
        "stock": 35,
    },
    {
        "name": "Canvas Tote Bag",
        "slug": "canvas-tote-bag",
        "description": "A reusable canvas bag for everyday errands.",
        "price": "14.25",
        "category": "clothing",
        "stock": 28,
    },
]

SEED_USERS = [
    {
        "email_env": "SEED_ADMIN_EMAIL",
        "password_env": "SEED_ADMIN_PASSWORD",
        "default_email": "admin@example.com",
        "first_name": "Sample",
        "last_name": "Admin",
        "role": "ADMIN",
        "is_staff": True,
    },
    {
        "email_env": "SEED_CUSTOMER_EMAIL",
        "password_env": "SEED_CUSTOMER_PASSWORD",
        "default_email": "customer@example.com",
        "first_name": "Sample",
        "last_name": "Customer",
        "role": "CUSTOMER",
        "is_staff": False,
    },
]


class Command(BaseCommand):
    help = "Create sample categories, products, and users without overwriting existing records."

    @transaction.atomic
    def handle(self, *args, **options):
        created_categories = self._seed_categories()
        created_products = self._seed_products()
        created_users, users_without_password = self._seed_users()

        self.stdout.write(
            self.style.SUCCESS(
                "Seed complete: "
                f"{created_categories} categories, {created_products} products, "
                f"{created_users} users created."
            )
        )
        if users_without_password:
            self.stdout.write(
                "Set SEED_ADMIN_PASSWORD and/or SEED_CUSTOMER_PASSWORD before "
                "running the command to make the corresponding new accounts usable."
            )

    def _seed_categories(self):
        created = 0
        for category_data in CATEGORIES:
            _, was_created = Category.objects.get_or_create(
                slug=category_data["slug"], defaults=category_data
            )
            created += was_created
        return created

    def _seed_products(self):
        created = 0
        categories = {category.slug: category for category in Category.objects.all()}
        for product_data in PRODUCTS:
            product_fields = product_data.copy()
            category = categories[product_fields.pop("category")]
            _, was_created = Product.objects.get_or_create(
                slug=product_fields["slug"],
                defaults={**product_fields, "category": category},
            )
            created += was_created
        return created

    def _seed_users(self):
        User = get_user_model()
        created = 0
        without_password = []

        for user_data in SEED_USERS:
            email = (
                os.getenv(user_data["email_env"], "").strip()
                or user_data["default_email"]
            )
            password = os.getenv(user_data["password_env"])
            defaults = {
                "first_name": user_data["first_name"],
                "last_name": user_data["last_name"],
                "role": user_data["role"],
                "is_staff": user_data["is_staff"],
            }
            user, was_created = User.objects.get_or_create(
                email=email, defaults=defaults
            )
            if was_created:
                if password:
                    user.set_password(password)
                else:
                    user.set_unusable_password()
                    without_password.append(email)
                user.save(update_fields=["password"])
                created += 1
            elif password and not user.has_usable_password():
                user.set_password(password)
                user.save(update_fields=["password"])
            elif not user.has_usable_password():
                without_password.append(email)

        return created, without_password
