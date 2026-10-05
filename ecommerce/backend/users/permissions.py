from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
    """
    Allows access only to users with the ADMIN role.
    """

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == "ADMIN"
        )


class IsOwnerOrAdmin(BasePermission):
    """
    Object-level permission:
    - ADMIN users can access any object.
    - Non-admin users can only access objects they own.

    The view must return an object with a recognisable owner attribute
    (checked in order: ``user``, ``owner``, or the object itself if it is
    a User instance).
    """

    def has_object_permission(self, request, view, obj):
        if request.user.role == "ADMIN":
            return True

        # Determine the owner of the object
        owner = _resolve_owner(obj)
        return owner == request.user


def _resolve_owner(obj):
    """Return the User instance that owns *obj*."""
    # Direct User instance (e.g. /users/<id>/)
    from django.contrib.auth import get_user_model

    User = get_user_model()
    if isinstance(obj, User):
        return obj
    # FK named `user` (most common: cart, order, profile …)
    if hasattr(obj, "user"):
        return obj.user
    # FK named `owner` (alternative naming)
    if hasattr(obj, "owner"):
        return obj.owner
    return None
