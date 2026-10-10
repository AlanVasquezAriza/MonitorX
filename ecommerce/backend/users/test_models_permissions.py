from types import SimpleNamespace

from django.contrib.auth.models import AnonymousUser
from django.test import TestCase

from .models import User
from .permissions import IsAdmin, IsOwnerOrAdmin, _resolve_owner


class UserManagerTests(TestCase):
    def test_create_user_requires_an_email(self):
        with self.assertRaisesMessage(ValueError, "The Email must be set"):
            User.objects.create_user(email="", password="StrongPass123!")

    def test_create_superuser_sets_required_admin_fields(self):
        user = User.objects.create_superuser(
            email="admin@example.com", password="StrongPass123!"
        )

        self.assertTrue(user.is_staff)
        self.assertTrue(user.is_superuser)
        self.assertTrue(user.is_active)
        self.assertEqual(user.role, User.Role.ADMIN)
        self.assertEqual(str(user), user.email)

    def test_create_superuser_rejects_invalid_privileges(self):
        with self.assertRaisesMessage(ValueError, "is_staff=True"):
            User.objects.create_superuser(
                email="not-staff@example.com",
                password="StrongPass123!",
                is_staff=False,
            )

        with self.assertRaisesMessage(ValueError, "is_superuser=True"):
            User.objects.create_superuser(
                email="not-superuser@example.com",
                password="StrongPass123!",
                is_superuser=False,
            )


class PermissionTests(TestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            email="admin@example.com", password="StrongPass123!", role=User.Role.ADMIN
        )
        self.customer = User.objects.create_user(
            email="customer@example.com",
            password="StrongPass123!",
            role=User.Role.CUSTOMER,
        )

    def test_is_admin_requires_an_authenticated_admin(self):
        permission = IsAdmin()

        self.assertTrue(permission.has_permission(SimpleNamespace(user=self.admin), None))
        self.assertFalse(permission.has_permission(SimpleNamespace(user=self.customer), None))
        self.assertFalse(permission.has_permission(SimpleNamespace(user=AnonymousUser()), None))

    def test_owner_resolution_supports_user_and_owner_attributes(self):
        self.assertEqual(_resolve_owner(self.customer), self.customer)
        self.assertEqual(
            _resolve_owner(SimpleNamespace(user=self.customer)), self.customer
        )
        self.assertEqual(
            _resolve_owner(SimpleNamespace(owner=self.customer)), self.customer
        )
        self.assertIsNone(_resolve_owner(SimpleNamespace()))

    def test_owner_or_admin_allows_only_the_owner_or_admin(self):
        permission = IsOwnerOrAdmin()
        owned_object = SimpleNamespace(owner=self.customer)

        self.assertTrue(
            permission.has_object_permission(
                SimpleNamespace(user=self.admin), None, owned_object
            )
        )
        self.assertTrue(
            permission.has_object_permission(
                SimpleNamespace(user=self.customer), None, owned_object
            )
        )
