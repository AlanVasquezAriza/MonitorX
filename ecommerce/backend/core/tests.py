from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status

class HealthCheckTests(APITestCase):
    def test_health_check(self):
        url = reverse("health_check")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "ok")
        self.assertEqual(response.data["database"], "connected")
