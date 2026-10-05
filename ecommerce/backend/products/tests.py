from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from categories.models import Category
from .models import Product

User = get_user_model()

PRODUCT_LIST_PATH = "product_list_create"
PRODUCT_DETAIL_PATH = "product_detail"


class ProductCRUDTests(APITestCase):
    """Tests for Product CRUD, search, filters, ordering and pagination (T1.8)."""

    def setUp(self):
        self.admin = User.objects.create_user(
            email="admin@example.com",
            password="AdminPass123!",
            role="ADMIN",
        )
        self.customer = User.objects.create_user(
            email="customer@example.com",
            password="CustPass123!",
            role="CUSTOMER",
        )
        self.category = Category.objects.create(name="Electronics", slug="electronics")
        self.product = Product.objects.create(
            name="Laptop",
            slug="laptop",
            description="A powerful laptop",
            price=999.99,
            category=self.category,
            stock=10,
        )

    def _auth(self, user):
        from rest_framework_simplejwt.tokens import RefreshToken
        token = RefreshToken.for_user(user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token.access_token}")

    # ── List & Retrieve ────────────────────────────────────────────────────
    def test_authenticated_user_can_list_products(self):
        self._auth(self.customer)
        url = reverse(PRODUCT_LIST_PATH)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 1)

    def test_unauthenticated_cannot_list_products(self):
        url = reverse(PRODUCT_LIST_PATH)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_authenticated_user_can_retrieve_product(self):
        self._auth(self.customer)
        url = reverse(PRODUCT_DETAIL_PATH, kwargs={"pk": self.product.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "Laptop")

    # ── Create (admin only) ────────────────────────────────────────────────
    def test_admin_can_create_product(self):
        self._auth(self.admin)
        url = reverse(PRODUCT_LIST_PATH)
        response = self.client.post(url, {
            "name": "Mouse",
            "slug": "mouse",
            "price": 29.99,
            "category": self.category.pk,
            "stock": 50,
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Product.objects.count(), 2)

    def test_customer_cannot_create_product(self):
        self._auth(self.customer)
        url = reverse(PRODUCT_LIST_PATH)
        response = self.client.post(url, {
            "name": "Mouse",
            "slug": "mouse",
            "price": 29.99,
            "category": self.category.pk,
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    # ── Update (admin only) ────────────────────────────────────────────────
    def test_admin_can_update_product(self):
        self._auth(self.admin)
        url = reverse(PRODUCT_DETAIL_PATH, kwargs={"pk": self.product.pk})
        response = self.client.patch(url, {"price": 899.99}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.product.refresh_from_db()
        self.assertEqual(float(self.product.price), 899.99)

    def test_customer_cannot_update_product(self):
        self._auth(self.customer)
        url = reverse(PRODUCT_DETAIL_PATH, kwargs={"pk": self.product.pk})
        response = self.client.patch(url, {"price": 1.00}, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    # ── Delete (admin only) ────────────────────────────────────────────────
    def test_admin_can_delete_product(self):
        self._auth(self.admin)
        url = reverse(PRODUCT_DETAIL_PATH, kwargs={"pk": self.product.pk})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Product.objects.count(), 0)

    def test_customer_cannot_delete_product(self):
        self._auth(self.customer)
        url = reverse(PRODUCT_DETAIL_PATH, kwargs={"pk": self.product.pk})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    # ── Search ─────────────────────────────────────────────────────────────
    def test_search_by_name(self):
        self._auth(self.customer)
        url = reverse(PRODUCT_LIST_PATH)
        response = self.client.get(url, {"search": "Laptop"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 1)

    def test_search_by_description(self):
        self._auth(self.customer)
        url = reverse(PRODUCT_LIST_PATH)
        response = self.client.get(url, {"search": "powerful"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 1)

    def test_search_no_results(self):
        self._auth(self.customer)
        url = reverse(PRODUCT_LIST_PATH)
        response = self.client.get(url, {"search": "nonexistent"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 0)

    # ── Filters ────────────────────────────────────────────────────────────
    def test_filter_by_category(self):
        self._auth(self.customer)
        url = reverse(PRODUCT_LIST_PATH)
        response = self.client.get(url, {"category": self.category.pk})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 1)

    def test_filter_by_is_active(self):
        self._auth(self.customer)
        url = reverse(PRODUCT_LIST_PATH)
        response = self.client.get(url, {"is_active": "true"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 1)

    # ── Ordering ───────────────────────────────────────────────────────────
    def test_order_by_price_ascending(self):
        Product.objects.create(name="Cheap", slug="cheap", price=10.00, category=self.category)
        self._auth(self.customer)
        url = reverse(PRODUCT_LIST_PATH)
        response = self.client.get(url, {"ordering": "price"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        prices = [float(p["price"]) for p in response.data["results"]]
        self.assertEqual(prices, sorted(prices))

    def test_order_by_price_descending(self):
        Product.objects.create(name="Cheap", slug="cheap", price=10.00, category=self.category)
        self._auth(self.customer)
        url = reverse(PRODUCT_LIST_PATH)
        response = self.client.get(url, {"ordering": "-price"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        prices = [float(p["price"]) for p in response.data["results"]]
        self.assertEqual(prices, sorted(prices, reverse=True))

    # ── Pagination ─────────────────────────────────────────────────────────
    def test_pagination_default_page_size(self):
        for i in range(15):
            Product.objects.create(name=f"Product {i}", slug=f"product-{i}", price=10.00, category=self.category)
        self._auth(self.customer)
        url = reverse(PRODUCT_LIST_PATH)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("results", response.data)
        self.assertIn("count", response.data)
        self.assertEqual(response.data["count"], 16)  # 15 new + 1 from setUp
        self.assertEqual(len(response.data["results"]), 10)  # Default page size

    def test_pagination_custom_page_size(self):
        for i in range(15):
            Product.objects.create(name=f"Product {i}", slug=f"product-{i}", price=10.00, category=self.category)
        self._auth(self.customer)
        url = reverse(PRODUCT_LIST_PATH)
        response = self.client.get(url, {"page_size": 5})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 5)
