from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status

def custom_exception_handler(exc, content):
    resp = exception_handler(exc, content)

    if resp is None:
        return Response(
            {"detail": "Server error."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
    
    if isinstance(resp.data, dict) and "detail" in resp.data:
        return resp
    
    return Response(
        {"errors": resp.data},
        status=resp.status_code,
    )