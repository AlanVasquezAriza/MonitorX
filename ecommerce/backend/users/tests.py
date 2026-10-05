from django.urls import reverse
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from rest_framework.test import APITestCase
from rest_framework import status

User = get_user_model()

REGISTER_PATH = 'register'
LOGIN_PATH = 'token_obtain_pair'
REFRESH_PATH = 'token_refresh'
LOGOUT_PATH = 'logout'
PROFILE_PATH = 'profile'
PW_RESET_REQUEST_PATH = 'password_reset_request'
PW_RESET_CONFIRM_PATH = 'password_reset_confirm'


class AuthFlowTests(APITestCase):
    """Tests for registration, login, refresh, logout and protected routes (T1.4)."""

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

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        url = reverse(LOGOUT_PATH)
        response = self.client.post(url, {'refresh': refresh_token}, format='json')
        self.assertEqual(response.status_code, status.HTTP_205_RESET_CONTENT)

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


class PasswordResetTests(APITestCase):
    """Tests for password recovery flow (T1.5)."""

    def setUp(self):
        self.user = User.objects.create_user(
            email='reset@example.com',
            password='OldPass123!',
        )
        self.generator = PasswordResetTokenGenerator()
        self.uid = urlsafe_base64_encode(force_bytes(self.user.pk))
        self.token = self.generator.make_token(self.user)

    # ── Request reset ─────────────────────────────────────────────────────
    def test_reset_request_with_existing_email_returns_200(self):
        """Always 200 — no email enumeration."""
        url = reverse(PW_RESET_REQUEST_PATH)
        response = self.client.post(url, {'email': 'reset@example.com'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('detail', response.data)

    def test_reset_request_with_unknown_email_still_returns_200(self):
        """Security: unknown emails must NOT return 404/400."""
        url = reverse(PW_RESET_REQUEST_PATH)
        response = self.client.post(url, {'email': 'nobody@example.com'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_reset_request_invalid_email_format_returns_400(self):
        url = reverse(PW_RESET_REQUEST_PATH)
        response = self.client.post(url, {'email': 'not-an-email'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    # ── Confirm reset ─────────────────────────────────────────────────────
    def test_reset_confirm_with_valid_token_changes_password(self):
        url = reverse(PW_RESET_CONFIRM_PATH)
        response = self.client.post(url, {
            'uid': self.uid,
            'token': self.token,
            'new_password': 'NewStrongPass456!',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Old password no longer works
        self.user.refresh_from_db()
        self.assertFalse(self.user.check_password('OldPass123!'))
        self.assertTrue(self.user.check_password('NewStrongPass456!'))

    def test_reset_confirm_invalid_token_returns_400(self):
        url = reverse(PW_RESET_CONFIRM_PATH)
        response = self.client.post(url, {
            'uid': self.uid,
            'token': 'totally-wrong-token',
            'new_password': 'NewStrongPass456!',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error']['code'], 'invalid_token')

    def test_reset_confirm_invalid_uid_returns_400(self):
        url = reverse(PW_RESET_CONFIRM_PATH)
        response = self.client.post(url, {
            'uid': 'invaliduid!!',
            'token': self.token,
            'new_password': 'NewStrongPass456!',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error']['code'], 'invalid_link')

    def test_reset_confirm_token_used_twice_returns_400(self):
        """A token cannot be reused after a successful reset."""
        url = reverse(PW_RESET_CONFIRM_PATH)
        payload = {
            'uid': self.uid,
            'token': self.token,
            'new_password': 'NewStrongPass456!',
        }
        self.client.post(url, payload, format='json')
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_reset_confirm_weak_password_returns_400(self):
        url = reverse(PW_RESET_CONFIRM_PATH)
        response = self.client.post(url, {
            'uid': self.uid,
            'token': self.token,
            'new_password': '123',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


# ── Permission path names ────────────────────────────────────────────────────
USER_LIST_PATH = 'user_list'
USER_DETAIL_PATH = 'user_detail'


class IsAdminPermissionTests(APITestCase):
    """Tests for the IsAdmin permission class (T1.6)."""

    def setUp(self):
        self.admin = User.objects.create_user(
            email='admin@example.com',
            password='AdminPass123!',
            role='ADMIN',
        )
        self.customer = User.objects.create_user(
            email='customer@example.com',
            password='CustPass123!',
            role='CUSTOMER',
        )

    def _auth(self, user):
        url = reverse(LOGIN_PATH)
        response = self.client.post(url, {
            'email': user.email,
            'password': 'AdminPass123!' if user.role == 'ADMIN' else 'CustPass123!',
        }, format='json')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {response.data["access"]}')

    # ── User list (IsAdmin) ──────────────────────────────────────────────
    def test_admin_can_list_users(self):
        self._auth(self.admin)
        url = reverse(USER_LIST_PATH)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_customer_cannot_list_users(self):
        self._auth(self.customer)
        url = reverse(USER_LIST_PATH)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_unauthenticated_cannot_list_users(self):
        url = reverse(USER_LIST_PATH)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class IsOwnerOrAdminPermissionTests(APITestCase):
    """Tests for the IsOwnerOrAdmin permission class (T1.6)."""

    def setUp(self):
        self.admin = User.objects.create_user(
            email='admin@example.com',
            password='AdminPass123!',
            role='ADMIN',
        )
        self.customer_a = User.objects.create_user(
            email='alice@example.com',
            password='AlicePass123!',
            role='CUSTOMER',
        )
        self.customer_b = User.objects.create_user(
            email='bob@example.com',
            password='BobPass123!',
            role='CUSTOMER',
        )

    def _auth(self, user):
        passwords = {
            self.admin.email: 'AdminPass123!',
            self.customer_a.email: 'AlicePass123!',
            self.customer_b.email: 'BobPass123!',
        }
        url = reverse(LOGIN_PATH)
        response = self.client.post(url, {
            'email': user.email,
            'password': passwords[user.email],
        }, format='json')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {response.data["access"]}')

    # ── Retrieve own profile ─────────────────────────────────────────────
    def test_customer_can_retrieve_own_profile(self):
        self._auth(self.customer_a)
        url = reverse(USER_DETAIL_PATH, kwargs={'pk': self.customer_a.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], self.customer_a.email)

    # ── Cannot retrieve another customer's profile ───────────────────────
    def test_customer_cannot_retrieve_other_user_profile(self):
        self._auth(self.customer_a)
        url = reverse(USER_DETAIL_PATH, kwargs={'pk': self.customer_b.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    # ── Admin can retrieve any profile ───────────────────────────────────
    def test_admin_can_retrieve_any_user_profile(self):
        self._auth(self.admin)
        url = reverse(USER_DETAIL_PATH, kwargs={'pk': self.customer_a.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], self.customer_a.email)

    # ── Update own profile ───────────────────────────────────────────────
    def test_customer_can_update_own_profile(self):
        self._auth(self.customer_a)
        url = reverse(USER_DETAIL_PATH, kwargs={'pk': self.customer_a.pk})
        response = self.client.patch(url, {'first_name': 'Alice'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.customer_a.refresh_from_db()
        self.assertEqual(self.customer_a.first_name, 'Alice')

    # ── Cannot update another customer's profile ─────────────────────────
    def test_customer_cannot_update_other_user_profile(self):
        self._auth(self.customer_a)
        url = reverse(USER_DETAIL_PATH, kwargs={'pk': self.customer_b.pk})
        response = self.client.patch(url, {'first_name': 'Hacked'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    # ── Admin can update any profile ─────────────────────────────────────
    def test_admin_can_update_any_user_profile(self):
        self._auth(self.admin)
        url = reverse(USER_DETAIL_PATH, kwargs={'pk': self.customer_b.pk})
        response = self.client.patch(url, {'first_name': 'Bobby'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.customer_b.refresh_from_db()
        self.assertEqual(self.customer_b.first_name, 'Bobby')

    # ── Unauthenticated access denied ────────────────────────────────────
    def test_unauthenticated_cannot_access_user_detail(self):
        url = reverse(USER_DETAIL_PATH, kwargs={'pk': self.customer_a.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

