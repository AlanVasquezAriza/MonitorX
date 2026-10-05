from decimal import Decimal

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from cart.models import Cart, CartItem
from categories.models import Category
from products.models import Product

from .models import Order, OrderItem

User = get_user_model()

ORDER_LIST_CREATE_PATH = "order_list_create"
ORDER_DETAIL_PATH = "order_detail"
CART_ADD_PATH = "cart_add"


class OrderTests(APITestCase):
    """Tests for creating orders from the cart (T1.11)."""

    def setUp(self):
        self.user = User.objects.create_user(
            email="customer@example.com",
            password="CustPass123!",
            role="CUSTOMER",
        )
        self.other = User.objects.create_user(
            email="other@example.com",
            password="CustPass123!",
            role="CUSTOMER",
        )
        self.admin = User.objects.create_user(
            email="admin@example.com",
            password="AdminPass123!",
            role="ADMIN",
        )
        self.category = Category.objects.create(name="Electronics", slug="electronics")
        self.product = Product.objects.create(
            name="Laptop",
            slug="laptop",
            price=Decimal("999.99"),
            category=self.category,
            stock=10,
        )
        self.product2 = Product.objects.create(
            name="Mouse",
            slug="mouse",
            price=Decimal("29.99"),
            category=self.category,
            stock=50,
        )

    def _auth(self, user):
        token = RefreshToken.for_user(user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token.access_token}")

    def _add_to_cart(self, product, quantity=1):
        url = reverse(CART_ADD_PATH)
        return self.client.post(
            url, {"product_id": product.pk, "quantity": quantity}, format="json"
        )

    def test_create_order_from_cart_empties_cart(self):
        self._auth(self.user)
        self._add_to_cart(self.product, 2)

        url = reverse(ORDER_LIST_CREATE_PATH)
        response = self.client.post(url, {}, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Order.objects.count(), 1)
        self.assertEqual(CartItem.objects.filter(cart__user=self.user).count(), 0)
        cart = Cart.objects.get(user=self.user)
        self.assertEqual(cart.items.count(), 0)

    def test_create_order_freezes_unit_price(self):
        self._auth(self.user)
        self._add_to_cart(self.product, 1)

        url = reverse(ORDER_LIST_CREATE_PATH)
        response = self.client.post(url, {}, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        order_item = OrderItem.objects.get()
        self.assertEqual(order_item.unit_price, Decimal("999.99"))

        self.product.price = Decimal("50.00")
        self.product.save(update_fields=["price"])
        order_item.refresh_from_db()
        self.assertEqual(order_item.unit_price, Decimal("999.99"))
        self.assertEqual(float(response.data["items"][0]["unit_price"]), 999.99)

    def test_create_order_snapshots_current_price_at_checkout(self):
        self._auth(self.user)
        self._add_to_cart(self.product, 1)
        self.product.price = Decimal("111.11")
        self.product.save(update_fields=["price"])

        url = reverse(ORDER_LIST_CREATE_PATH)
        response = self.client.post(url, {}, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(OrderItem.objects.get().unit_price, Decimal("111.11"))

    def test_create_order_sets_pending_status_and_total(self):
        self._auth(self.user)
        self._add_to_cart(self.product, 1)
        self._add_to_cart(self.product2, 2)

        url = reverse(ORDER_LIST_CREATE_PATH)
        response = self.client.post(url, {}, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["status"], Order.Status.PENDING)
        expected = Decimal("999.99") + (Decimal("29.99") * 2)
        self.assertEqual(Decimal(response.data["total"]), expected)
        self.assertEqual(len(response.data["items"]), 2)

    def test_create_order_decrements_stock(self):
        self._auth(self.user)
        self._add_to_cart(self.product, 3)

        url = reverse(ORDER_LIST_CREATE_PATH)
        response = self.client.post(url, {}, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 7)

    def test_create_order_empty_cart_returns_400(self):
        self._auth(self.user)
        url = reverse(ORDER_LIST_CREATE_PATH)
        response = self.client.post(url, {}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["error"]["code"], "empty_cart")
        self.assertEqual(Order.objects.count(), 0)

    def test_create_order_insufficient_stock_returns_400_and_rolls_back(self):
        self._auth(self.user)
        self._add_to_cart(self.product, 1)
        self._add_to_cart(self.product2, 1)
        self.product.stock = 0
        self.product.save(update_fields=["stock"])

        url = reverse(ORDER_LIST_CREATE_PATH)
        response = self.client.post(url, {}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["error"]["code"], "insufficient_stock")
        self.assertEqual(Order.objects.count(), 0)
        self.assertEqual(CartItem.objects.filter(cart__user=self.user).count(), 2)
        self.product2.refresh_from_db()
        self.assertEqual(self.product2.stock, 50)

    def test_create_order_inactive_product_returns_400(self):
        self._auth(self.user)
        self._add_to_cart(self.product, 1)
        self.product.is_active = False
        self.product.save(update_fields=["is_active"])

        url = reverse(ORDER_LIST_CREATE_PATH)
        response = self.client.post(url, {}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["error"]["code"], "product_unavailable")
        self.assertEqual(Order.objects.count(), 0)

    def test_create_order_requires_auth(self):
        url = reverse(ORDER_LIST_CREATE_PATH)
        response = self.client.post(url, {}, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_order_existing_empty_cart_returns_400(self):
        self._auth(self.user)
        Cart.objects.create(user=self.user)
        url = reverse(ORDER_LIST_CREATE_PATH)
        response = self.client.post(url, {}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["error"]["code"], "empty_cart")

    def test_owner_can_retrieve_order(self):
        self._auth(self.user)
        self._add_to_cart(self.product, 1)
        create = self.client.post(reverse(ORDER_LIST_CREATE_PATH), {}, format="json")
        order_id = create.data["id"]

        response = self.client.get(reverse(ORDER_DETAIL_PATH, kwargs={"pk": order_id}))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["id"], order_id)
        self.assertEqual(len(response.data["items"]), 1)

    def test_list_orders_returns_own_orders_only(self):
        self._auth(self.other)
        self._add_to_cart(self.product, 1)
        self.client.post(reverse(ORDER_LIST_CREATE_PATH), {}, format="json")

        self._auth(self.user)
        self._add_to_cart(self.product2, 1)
        self.client.post(reverse(ORDER_LIST_CREATE_PATH), {}, format="json")

        response = self.client.get(reverse(ORDER_LIST_CREATE_PATH))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 1)
        self.assertEqual(response.data["results"][0]["user"], self.user.pk)

    def test_customer_cannot_retrieve_another_users_order(self):
        self._auth(self.other)
        self._add_to_cart(self.product, 1)
        create = self.client.post(reverse(ORDER_LIST_CREATE_PATH), {}, format="json")
        order_id = create.data["id"]

        self._auth(self.user)
        response = self.client.get(reverse(ORDER_DETAIL_PATH, kwargs={"pk": order_id}))
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_admin_can_list_all_orders_and_update_status(self):
        self._auth(self.user)
        self._add_to_cart(self.product, 1)
        create = self.client.post(reverse(ORDER_LIST_CREATE_PATH), {}, format="json")
        order_id = create.data["id"]

        self._auth(self.admin)
        listing = self.client.get(reverse(ORDER_LIST_CREATE_PATH))
        self.assertEqual(listing.status_code, status.HTTP_200_OK)
        self.assertEqual(len(listing.data["results"]), 1)

        response = self.client.patch(
            reverse(ORDER_DETAIL_PATH, kwargs={"pk": order_id}),
            {"status": Order.Status.PAID},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], Order.Status.PAID)

    def test_customer_cannot_update_order_status(self):
        self._auth(self.user)
        self._add_to_cart(self.product, 1)
        create = self.client.post(reverse(ORDER_LIST_CREATE_PATH), {}, format="json")
        order_id = create.data["id"]

        response = self.client.patch(
            reverse(ORDER_DETAIL_PATH, kwargs={"pk": order_id}),
            {"status": Order.Status.PAID},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
