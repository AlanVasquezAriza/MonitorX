from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Overrides SimpleJWT to accept 'email' instead of 'username'
    and includes user data in the response.
    """
    username_field = User.USERNAME_FIELD  # 'email'

    def validate(self, attrs):
        data = super().validate(attrs)
        # Attach user info so the frontend doesn't need a second request
        data['user'] = {
            'id': self.user.pk,
            'email': self.user.email,
            'first_name': self.user.first_name,
            'last_name': self.user.last_name,
            'role': self.user.role,
            'is_staff': self.user.is_staff,
            'phone_number': self.user.phone_number,
        }
        return data


class UserSerializer(serializers.ModelSerializer):
    username = serializers.SerializerMethodField()
    is_staff = serializers.BooleanField(required=False)
    role = serializers.ChoiceField(choices=User.Role.choices, required=False)

    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'first_name', 'last_name', 'phone_number', 'role', 'is_staff', 'created_at']
        read_only_fields = ['id', 'created_at']

    def get_username(self, obj):
        # The frontend normalizer expects 'username'; use email as username since the model has none
        return obj.email

    def update(self, instance, validated_data):
        if 'is_staff' in validated_data and 'role' not in validated_data:
            validated_data['role'] = User.Role.ADMIN if validated_data['is_staff'] else User.Role.CUSTOMER
        elif 'role' in validated_data and 'is_staff' not in validated_data:
            validated_data['is_staff'] = (validated_data['role'] == User.Role.ADMIN)
        return super().update(instance, validated_data)



class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = ['email', 'password', 'first_name', 'last_name']

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        return user


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)


class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField(required=True)
    token = serializers.CharField(required=True)
    new_password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
    )

    def validate_new_password(self, value):
        validate_password(value)
        return value
