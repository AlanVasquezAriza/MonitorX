from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Category

User = get_user_model()

CATEGORY_LIST_PATH = "category_list_create"
CATEGORY_DETAIL_PATH = "category_detail"


class CategoryCRUDTests(APITestCase):
    """Tests for Category CRUD with role-based permissions (T1.7)."""

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
        self.category = Category.objects.create(
            name="Electronics",
            slug="electronics",
            description="Electronic devices",
        )

    def _auth(self, user):
        from rest_framework_simplejwt.tokens import RefreshToken
        token = RefreshToken.for_user(user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token.access_token}")

    # ── List (any authenticated user) ─────────────────────────────────────
    def test_authenticated_user_can_list_categories(self):
        self._auth(self.customer)
        url = reverse(CATEGORY_LIST_PATH)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 1)

    def test_unauthenticated_cannot_list_categories(self):
        url = reverse(CATEGORY_LIST_PATH)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    # ── Create (admin only) ───────────────────────────────────────────────
    def test_admin_can_create_category(self):
        self._auth(self.admin)
        url = reverse(CATEGORY_LIST_PATH)
        response = self.client.post(url, {
            "name": "Books",
            "slug": "books",
            "description": "All kinds of books",
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Category.objects.count(), 2)

    def test_customer_cannot_create_category(self):
        self._auth(self.customer)
        url = reverse(CATEGORY_LIST_PATH)
        response = self.client.post(url, {
            "name": "Books",
            "slug": "books",
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_unauthenticated_cannot_create_category(self):
        url = reverse(CATEGORY_LIST_PATH)
        response = self.client.post(url, {
            "name": "Books",
            "slug": "books",
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_category_with_duplicate_name_returns_400(self):
        self._auth(self.admin)
        url = reverse(CATEGORY_LIST_PATH)
        response = self.client.post(url, {
            "name": "Electronics",
            "slug": "electronics-2",
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    # ── Retrieve (any authenticated user) ─────────────────────────────────
    def test_authenticated_user_can_retrieve_category(self):
        self._auth(self.customer)
        url = reverse(CATEGORY_DETAIL_PATH, kwargs={"pk": self.category.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "Electronics")

    def test_unauthenticated_cannot_retrieve_category(self):
        url = reverse(CATEGORY_DETAIL_PATH, kwargs={"pk": self.category.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    # ── Update (admin only) ───────────────────────────────────────────────
    def test_admin_can_update_category(self):
        self._auth(self.admin)
        url = reverse(CATEGORY_DETAIL_PATH, kwargs={"pk": self.category.pk})
        response = self.client.patch(url, {"description": "Updated desc"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.category.refresh_from_db()
        self.assertEqual(self.category.description, "Updated desc")

    def test_customer_cannot_update_category(self):
        self._auth(self.customer)
        url = reverse(CATEGORY_DETAIL_PATH, kwargs={"pk": self.category.pk})
        response = self.client.patch(url, {"description": "Hacked"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_unauthenticated_cannot_update_category(self):
        url = reverse(CATEGORY_DETAIL_PATH, kwargs={"pk": self.category.pk})
        response = self.client.patch(url, {"description": "Hacked"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    # ── Delete (admin only) ───────────────────────────────────────────────
    def test_admin_can_delete_category(self):
        self._auth(self.admin)
        url = reverse(CATEGORY_DETAIL_PATH, kwargs={"pk": self.category.pk})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Category.objects.count(), 0)

    def test_customer_cannot_delete_category(self):
        self._auth(self.customer)
        url = reverse(CATEGORY_DETAIL_PATH, kwargs={"pk": self.category.pk})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_unauthenticated_cannot_delete_category(self):
        url = reverse(CATEGORY_DETAIL_PATH, kwargs={"pk": self.category.pk})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
