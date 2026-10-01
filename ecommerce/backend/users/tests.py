from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status

User = get_user_model()

REGISTER_URL = reverse.__func__ if callable(getattr(reverse, '__func__', None)) else None
REGISTER_PATH = 'register'
LOGIN_PATH = 'token_obtain_pair'
REFRESH_PATH = 'token_refresh'
LOGOUT_PATH = 'logout'
PROFILE_PATH = 'profile'
HEALTH_PATH = 'health_check'


class AuthFlowTests(APITestCase):
    """Tests for registration, login, refresh, logout and protected routes."""

    def setUp(self):
        self.user_data = {
            'email': 'test@example.com',
            'password': 'StrongPass123!',
            'first_name': 'John',
            'last_name': 'Doe',
        }

    # ── Registration ────────────────────────────────────────────────────────
    def test_register_success(self):
        url = reverse(REGISTER_PATH)
        response = self.client.post(url, self.user_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.count(), 1)
        self.assertEqual(User.objects.get().email, 'test@example.com')
        self.assertNotIn('password', response.data)

    def test_register_missing_fields_returns_400(self):
        url = reverse(REGISTER_PATH)
        response = self.client.post(url, {'email': 'bad@example.com'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_duplicate_email_returns_400(self):
        url = reverse(REGISTER_PATH)
        self.client.post(url, self.user_data, format='json')
        response = self.client.post(url, self.user_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    # ── Login ────────────────────────────────────────────────────────────────
    def _create_user(self):
        return User.objects.create_user(
            email=self.user_data['email'],
            password=self.user_data['password'],
        )

    def _login(self):
        url = reverse(LOGIN_PATH)
        response = self.client.post(url, {
            'email': self.user_data['email'],
            'password': self.user_data['password'],
        }, format='json')
        return response

    def test_login_success_returns_tokens(self):
        self._create_user()
        response = self._login()
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_login_wrong_credentials_returns_401(self):
        self._create_user()
        url = reverse(LOGIN_PATH)
        response = self.client.post(url, {
            'email': self.user_data['email'],
            'password': 'WrongPassword',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    # ── Refresh ──────────────────────────────────────────────────────────────
    def test_refresh_returns_new_access_token(self):
        self._create_user()
        login_response = self._login()
        refresh_token = login_response.data['refresh']

        url = reverse(REFRESH_PATH)
        response = self.client.post(url, {'refresh': refresh_token}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)

    def test_refresh_with_invalid_token_returns_401(self):
        url = reverse(REFRESH_PATH)
        response = self.client.post(url, {'refresh': 'invalid.token.here'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    # ── Logout (blacklist) ───────────────────────────────────────────────────
    def test_logout_blacklists_refresh_token(self):
        self._create_user()
        login_response = self._login()
        access_token = login_response.data['access']
        refresh_token = login_response.data['refresh']

        # Logout
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        url = reverse(LOGOUT_PATH)
        response = self.client.post(url, {'refresh': refresh_token}, format='json')
        self.assertEqual(response.status_code, status.HTTP_205_RESET_CONTENT)

        # The blacklisted refresh should now be rejected
        refresh_url = reverse(REFRESH_PATH)
        refresh_response = self.client.post(refresh_url, {'refresh': refresh_token}, format='json')
        self.assertEqual(refresh_response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_logout_without_auth_returns_401(self):
        url = reverse(LOGOUT_PATH)
        response = self.client.post(url, {'refresh': 'sometoken'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    # ── Protected route without token ────────────────────────────────────────
    def test_profile_without_token_returns_401(self):
        url = reverse(PROFILE_PATH)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_profile_with_valid_token_returns_user_data(self):
        self._create_user()
        login_response = self._login()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {login_response.data["access"]}')

        url = reverse(PROFILE_PATH)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], self.user_data['email'])
        self.assertNotIn('password', response.data)
