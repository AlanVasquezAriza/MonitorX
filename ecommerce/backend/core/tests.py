import os
from io import StringIO
from unittest import mock

from django.core.management import call_command
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from categories.models import Category
from products.models import Product
from users.models import User


class HealthCheckTests(APITestCase):
    def test_health_check(self):
        response = self.client.get(reverse("health_check"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "ok")
        self.assertEqual(response.data["database"], "connected")


class SeedDataCommandTests(TestCase):
    def test_seed_data_creates_sample_records_without_duplicates(self):
        emails = {
            "SEED_ADMIN_EMAIL": "seed-admin@example.com",
            "SEED_CUSTOMER_EMAIL": "seed-customer@example.com",
            "SEED_ADMIN_PASSWORD": "",
            "SEED_CUSTOMER_PASSWORD": "",
        }
        with mock.patch.dict(os.environ, emails):
            call_command("seed_data", stdout=StringIO())

            admin = User.objects.get(email=emails["SEED_ADMIN_EMAIL"])
            self.assertEqual(admin.role, User.Role.ADMIN)
            self.assertFalse(admin.has_usable_password())
            self.assertEqual(
                User.objects.get(email=emails["SEED_CUSTOMER_EMAIL"]).role,
                User.Role.CUSTOMER,
            )
            self.assertEqual(Category.objects.count(), 4)
            self.assertEqual(Product.objects.count(), 8)

            env_with_passwords = {
                **emails,
                "SEED_ADMIN_PASSWORD": "SeedAdminPass123!",
                "SEED_CUSTOMER_PASSWORD": "SeedCustomerPass123!",
            }
            with mock.patch.dict(os.environ, env_with_passwords):
                call_command("seed_data", stdout=StringIO())
                admin.refresh_from_db()
                self.assertTrue(
                    admin.check_password(env_with_passwords["SEED_ADMIN_PASSWORD"])
                )

                env_with_new_password = {
                    **env_with_passwords,
                    "SEED_ADMIN_PASSWORD": "DifferentPass123!",
                }
                with mock.patch.dict(os.environ, env_with_new_password):
                    call_command("seed_data", stdout=StringIO())
                    admin.refresh_from_db()
                    self.assertTrue(
                        admin.check_password(env_with_passwords["SEED_ADMIN_PASSWORD"])
                    )

        self.assertEqual(Category.objects.count(), 4)
        self.assertEqual(Product.objects.count(), 8)
        self.assertEqual(User.objects.count(), 2)
