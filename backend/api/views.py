from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.exceptions import ValidationError
from .models import Category, Transaction
from .serializers import CategorySerializer, TransactionSerializer, RegisterSerializer
from django.db import IntegrityError
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.throttling import AnonRateThrottle
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from django.core.mail import send_mail
from django.conf import settings

User = get_user_model()

# Create your views here.
class CategoryViewSet(ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Category.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        try:
            self.perform_destroy(instance)
        except IntegrityError:
            return Response(
                {"detail": "Category is used by transactions."},
                status = status.HTTP_409_CONFLICT,
            )
        return Response(status=status.HTTP_204_NO_CONTENT)


class TransactionViewSet(ModelViewSet):
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = Transaction.objects.select_related("category").filter(user=self.request.user)

        month = self.request.query_params.get("month")
        category_id = self.request.query_params.get("category")
        tx_type = self.request.query_params.get("type")

        if tx_type in ("income", "expense"):
            qs = qs.filter(type=tx_type)

        if category_id and category_id.isdigit():
            qs = qs.filter(category_id=int(category_id))

        if month:
            try:
                year_str, mon_str = month.split("-",1)
                year = int(year_str)
                mon = int(mon_str)
                if mon < 1 or mon > 12:
                    raise ValueError
                qs = qs.filter(date__year=year, date__month=mon)
            except Exception:
                raise ValidationError({"month": ["Invalid format. Use YYYY-MM."]})

        sort = self.request.query_params.get("sort")
        allowed_sort = {"date_desc", "date_asc", "amount_desc", "amount_asc"}
        if sort:
            if sort not in allowed_sort:
                raise ValidationError({"sort": ["Invalid sort."]})
            
            if sort == "date_desc":
                qs = qs.order_by("-date")
            elif sort == "date_asc":
                qs = qs.order_by("date")
            elif sort == "amount_desc":
                qs = qs.order_by("-amount")
            elif sort == "amount_asc":
                qs = qs.order_by("amount")
        
        q = self.request.query_params.get("q")
        if q:
            qs = qs.filter(description__icontains=q)

        return qs
        
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=["get"], url_path="months")
    def months(self, request):
        qs = self.get_queryset()

        tx_type = self.request.query_params.get("type")
        category_id = self.request.query_params.get("category")
        q = self.request.query_params.get("q")

        if tx_type in ("income", "expense"):
            qs = qs.filter(type=tx_type)

        if category_id and category_id.isdigit():
            qs = qs.filter(category_id=int(category_id))

        if q:
            qs = qs.filter(description__icontains = q)

        months = sorted({d.strftime("%Y-%m") for d in qs.values_list("date", flat=True)}, reverse=True)
        return Response({"results": months})


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response({"username": user.username}, status=status.HTTP_201_CREATED)
    

class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email", "").strip().lower()

        if not email:
            return Response(
                {"email": ["Email is required."]},
                status = status.HTTP_400_BAD_REQUEST,
            )

        user = User.objects.filter(email__iexact=email).first()

        if user:
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)

            reset_link = (
                f"{settings.FRONTEND_URL}/reset-password/"
                f"?uid={uid}&token={token}"
            )

            return Response(
                {
                    "detail": "Reset link generated successfully.",
                    "reset_link": reset_link,
                },
                status=status.HTTP_200_OK,
            )
        
        return Response(
            {
                "detail": "If an account with that email exists, a password reset link has been sent."
            },
            status=status.HTTP_200_OK,
        )
    
class LoginRateThrottle(AnonRateThrottle):
    rate = "5/min"

class RateLimitedTokenView(TokenObtainPairView):
    throttle_classes = [LoginRateThrottle]