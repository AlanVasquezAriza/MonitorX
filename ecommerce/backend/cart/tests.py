from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from categories.models import Category
from products.models import Product
from .models import Cart, CartItem

User = get_user_model()

CART_DETAIL_PATH = "cart_detail"
CART_ADD_PATH = "cart_add"
CART_ITEM_UPDATE_PATH = "cart_item_update"
CART_ITEM_REMOVE_PATH = "cart_item_remove"


class CartTests(APITestCase):
    """Tests for Cart: add, update quantity, remove, subtotal and total (T1.10)."""

    def setUp(self):
        self.user = User.objects.create_user(
            email="customer@example.com",
            password="CustPass123!",
            role="CUSTOMER",
        )
        self.category = Category.objects.create(name="Electronics", slug="electronics")
        self.product = Product.objects.create(
            name="Laptop",
            slug="laptop",
            price=999.99,
            category=self.category,
            stock=10,
        )
        self.product2 = Product.objects.create(
            name="Mouse",
            slug="mouse",
            price=29.99,
            category=self.category,
            stock=50,
        )

    def _auth(self):
        from rest_framework_simplejwt.tokens import RefreshToken
        token = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token.access_token}")

    # ── Add to cart ────────────────────────────────────────────────────────
    def test_add_product_to_cart(self):
        self._auth()
        url = reverse(CART_ADD_PATH)
        response = self.client.post(url, {"product_id": self.product.pk, "quantity": 2}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["item_count"], 2)
        self.assertEqual(float(response.data["total"]), 1999.98)

    def test_add_same_product_increments_quantity(self):
        self._auth()
        url = reverse(CART_ADD_PATH)
        self.client.post(url, {"product_id": self.product.pk, "quantity": 1}, format="json")
        response = self.client.post(url, {"product_id": self.product.pk, "quantity": 2}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["item_count"], 3)

    def test_add_inactive_product_returns_404(self):
        self._auth()
        self.product.is_active = False
        self.product.save()
        url = reverse(CART_ADD_PATH)
        response = self.client.post(url, {"product_id": self.product.pk, "quantity": 1}, format="json")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_add_nonexistent_product_returns_404(self):
        self._auth()
        url = reverse(CART_ADD_PATH)
        response = self.client.post(url, {"product_id": 9999, "quantity": 1}, format="json")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_add_to_cart_requires_auth(self):
        url = reverse(CART_ADD_PATH)
        response = self.client.post(url, {"product_id": self.product.pk, "quantity": 1}, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    # ── View cart ──────────────────────────────────────────────────────────
    def test_view_cart(self):
        self._auth()
        url = reverse(CART_ADD_PATH)
        self.client.post(url, {"product_id": self.product.pk, "quantity": 1}, format="json")

        url = reverse(CART_DETAIL_PATH)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["items"]), 1)
        self.assertEqual(response.data["items"][0]["product_name"], "Laptop")

    def test_view_cart_requires_auth(self):
        url = reverse(CART_DETAIL_PATH)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    # ── Update quantity ────────────────────────────────────────────────────
    def test_update_item_quantity(self):
        self._auth()
        url = reverse(CART_ADD_PATH)
        self.client.post(url, {"product_id": self.product.pk, "quantity": 1}, format="json")

        cart_item = CartItem.objects.first()
        url = reverse(CART_ITEM_UPDATE_PATH, kwargs={"pk": cart_item.pk})
        response = self.client.patch(url, {"quantity": 5}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["item_count"], 5)

    def test_update_item_quantity_invalid_returns_400(self):
        self._auth()
        url = reverse(CART_ADD_PATH)
        self.client.post(url, {"product_id": self.product.pk, "quantity": 1}, format="json")

        cart_item = CartItem.objects.first()
        url = reverse(CART_ITEM_UPDATE_PATH, kwargs={"pk": cart_item.pk})
        response = self.client.patch(url, {"quantity": 0}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_update_nonexistent_item_returns_404(self):
        self._auth()
        url = reverse(CART_ITEM_UPDATE_PATH, kwargs={"pk": 9999})
        response = self.client.patch(url, {"quantity": 2}, format="json")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # ── Remove item ────────────────────────────────────────────────────────
    def test_remove_item_from_cart(self):
        self._auth()
        url = reverse(CART_ADD_PATH)
        self.client.post(url, {"product_id": self.product.pk, "quantity": 1}, format="json")

        cart_item = CartItem.objects.first()
        url = reverse(CART_ITEM_REMOVE_PATH, kwargs={"pk": cart_item.pk})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(CartItem.objects.count(), 0)

    def test_remove_nonexistent_item_returns_404(self):
        self._auth()
        url = reverse(CART_ITEM_REMOVE_PATH, kwargs={"pk": 9999})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # ── Subtotal and total ─────────────────────────────────────────────────
    def test_cart_subtotal_and_total_with_multiple_items(self):
        self._auth()
        url = reverse(CART_ADD_PATH)
        self.client.post(url, {"product_id": self.product.pk, "quantity": 1}, format="json")
        self.client.post(url, {"product_id": self.product2.pk, "quantity": 2}, format="json")

        url = reverse(CART_DETAIL_PATH)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        expected_total = 999.99 + (29.99 * 2)
        self.assertAlmostEqual(float(response.data["total"]), expected_total, places=2)
        self.assertAlmostEqual(float(response.data["subtotal"]), expected_total, places=2)
