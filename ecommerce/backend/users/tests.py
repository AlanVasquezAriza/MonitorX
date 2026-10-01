from django.contrib.auth import get_user_model
from django.test import TestCase

User = get_user_model()

class CustomUserTests(TestCase):
    def test_create_user(self):
        user = User.objects.create_user(
            email="customer@example.com",
            password="testpassword123",
            first_name="John",
            last_name="Doe",
        )
        self.assertEqual(user.email, "customer@example.com")
        self.assertTrue(user.check_password("testpassword123"))
        self.assertEqual(user.role, User.Role.CUSTOMER)
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)

    def test_create_superuser(self):
        admin_user = User.objects.create_superuser(
            email="admin@example.com",
            password="testpassword123",
        )
        self.assertEqual(admin_user.email, "admin@example.com")
        self.assertEqual(admin_user.role, User.Role.ADMIN)
        self.assertTrue(admin_user.is_staff)
        self.assertTrue(admin_user.is_superuser)
        self.assertTrue(admin_user.is_active)
