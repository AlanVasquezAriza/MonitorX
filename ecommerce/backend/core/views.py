from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.db import connection
from django.db.utils import OperationalError

@api_view(["GET"])
@permission_classes([AllowAny])
def health_check(request):
    """
    Health check endpoint that verifies database connectivity.
    """
    db_healthy = False
    try:
        connection.ensure_connection()
        db_healthy = True
    except OperationalError:
        pass
    
    status_code = 200 if db_healthy else 503
    return Response(
        {
            "status": "ok" if db_healthy else "error",
            "database": "connected" if db_healthy else "disconnected",
        },
        status=status_code,
    )
