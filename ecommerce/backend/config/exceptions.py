"""
Global exception handler for uniform error responses.

All error responses follow the format:
{
    "error": {
        "code": "<machine-readable-code>",
        "message": "<human-readable-message>"
    }
}
"""
from rest_framework import status
from rest_framework.exceptions import (
    APIException,
    AuthenticationFailed,
    NotAuthenticated,
    PermissionDenied,
    NotFound,
    ValidationError,
    MethodNotAllowed,
    NotAcceptable,
    UnsupportedMediaType,
    Throttled,
)
from rest_framework.response import Response
from rest_framework.views import exception_handler as drf_exception_handler
from django.db import IntegrityError, DatabaseError
from django.core.exceptions import ValidationError as DjangoValidationError
from django.http import Http404


def custom_exception_handler(exc, context):
    """
    Custom exception handler that returns uniform error format.
    """
    # Let DRF handle the exception first to get the standard response
    response = drf_exception_handler(exc, context)

    if response is not None:
        # DRF handled it - convert to our format
        return _convert_drf_response(response, exc)

    # DRF didn't handle it - check for Django exceptions
    if isinstance(exc, Http404):
        return Response(
            {"error": {"code": "not_found", "message": "Resource not found."}},
            status=status.HTTP_404_NOT_FOUND,
        )

    if isinstance(exc, DjangoValidationError):
        return Response(
            {"error": {"code": "validation_error", "message": str(exc)}},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if isinstance(exc, IntegrityError):
        return Response(
            {"error": {"code": "integrity_error", "message": "Database integrity error."}},
            status=status.HTTP_409_CONFLICT,
        )

    if isinstance(exc, DatabaseError):
        return Response(
            {"error": {"code": "database_error", "message": "A database error occurred."}},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    # Unhandled exception - return 500
    return Response(
        {"error": {"code": "server_error", "message": "An unexpected error occurred."}},
        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )


def _convert_drf_response(response, exc):
    """Convert DRF response to uniform error format."""
    error_code = _get_error_code(exc, response.status_code)
    error_message = _get_error_message(exc, response.data)

    return Response(
        {"error": {"code": error_code, "message": error_message}},
        status=response.status_code,
    )


def _get_error_code(exc, status_code):
    """Map exception/status to machine-readable error code."""
    if isinstance(exc, NotAuthenticated):
        return "authentication_required"
    if isinstance(exc, AuthenticationFailed):
        return "authentication_failed"
    if isinstance(exc, PermissionDenied):
        return "permission_denied"
    if isinstance(exc, NotFound):
        return "not_found"
    if isinstance(exc, ValidationError):
        return "validation_error"
    if isinstance(exc, MethodNotAllowed):
        return "method_not_allowed"
    if isinstance(exc, NotAcceptable):
        return "not_acceptable"
    if isinstance(exc, UnsupportedMediaType):
        return "unsupported_media_type"
    if isinstance(exc, Throttled):
        return "rate_limit_exceeded"

    # Fallback based on status code
    status_codes = {
        400: "bad_request",
        401: "unauthorized",
        403: "forbidden",
        404: "not_found",
        405: "method_not_allowed",
        406: "not_acceptable",
        415: "unsupported_media_type",
        422: "unprocessable_entity",
        429: "rate_limit_exceeded",
        500: "server_error",
    }
    return status_codes.get(status_code, "error")


def _get_error_message(exc, data):
    """Extract human-readable message from exception/response data."""
    if isinstance(data, dict):
        # DRF validation errors: {'field': ['error1', 'error2'], ...}
        # or detail: 'message'
        if "detail" in data:
            detail = data["detail"]
            if isinstance(detail, list):
                return " ".join(str(d) for d in detail)
            return str(detail)
        # Field-specific errors
        messages = []
        for field, errors in data.items():
            if isinstance(errors, list):
                for error in errors:
                    messages.append(f"{field}: {error}")
            else:
                messages.append(f"{field}: {errors}")
        if messages:
            return "; ".join(messages)

    if isinstance(data, list):
        return " ".join(str(d) for d in data)

    if hasattr(exc, "detail"):
        detail = exc.detail
        if isinstance(detail, dict) and "detail" in detail:
            return str(detail["detail"])
        if isinstance(detail, list):
            return " ".join(str(d) for d in detail)
        return str(detail)

    return str(exc) if str(exc) else "An error occurred."