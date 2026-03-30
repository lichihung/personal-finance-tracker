from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.exceptions import ValidationError
from .models import Category, Transaction, UserSecurity
from .serializers import CategorySerializer, TransactionSerializer, RegisterSerializer, ResetPasswordSerializer, EmailOrUsernameTokenObtainPairSerializer, VerifyEmailSerializer
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
from django.http import HttpResponse
import csv
from datetime import datetime

User = get_user_model()

def block_demo_writes(request):
    if request.user.is_authenticated and request.user.username == "demo":
        raise ValidationError({"detail": ["Demo account is read-only."]})

# Create your views here.
class CategoryViewSet(ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Category.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        block_demo_writes(self.request)
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        block_demo_writes(self.request)
        serializer.save()

    def destroy(self, request, *args, **kwargs):
        block_demo_writes(request)
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
        block_demo_writes(self.request)
        serializer.save(user=self.request.user)
    
    def perform_update(self, serializer):
        block_demo_writes(self.request)
        serializer.save()

    @action(detail=False, methods=["get"], url_path="months")
    def months(self, request):
        qs = Transaction.objects.filter(user=request.user)

        months = sorted(
            {d.strftime("%Y-%m") for d in qs.values_list("date", flat=True)},
            reverse=True
        )

        return Response({"results": months})
    
    @action(detail=False, methods=["get"])
    def export(self, request):
        qs = self.get_queryset()

        export_month = request.query_params.get("month")

        if not export_month:
            today = datetime.today().date()
            qs = qs.filter(date__year=today.year, date__month=today.month)
            filename_month = today.strftime("%Y-%m")
        else:
            filename_month = export_month

        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = f'attachment; filename="transactions-{filename_month}.csv"'

        writer = csv.writer(response)
        writer.writerow(["Date", "Type", "Category", "Description", "Amount"])

        for t in qs:
            amount = t.amount if t.type == "income" else -t.amount

            writer.writerow([
                t.date.strftime("%Y-%m-%d"),
                t.type,
                t.category.name if t.category else "",
                t.description,
                amount,
            ])

        return response
    
    def destroy(self, request, *args, **kwargs):
        block_demo_writes(request)
        return super().destroy(request, *args, **kwargs)


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        security, _ = UserSecurity.objects.get_or_create(user=user)
        security.email_verified = False
        security.save()

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)

        verify_link = (
            f"{settings.FRONTEND_URL}/verify-email/"
            f"?uid={uid}&token={token}"
        )

        try:
            send_mail(
                subject="Verify your Finance Tracker email",
                message=(
                    f"Hi {user.username},\n\n"
                    "Thanks for creating your account.\n\n"
                    f"Use this link to verify your email:\n{verify_link}\n\n"
                    "If you did not create this account, you can ignore this email.\n\n"
                    "Sincerely,\n"
                    "Finance Tracker"
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False,
            )
        except Exception as e:
            print("VERIFICATION EMAIL ERROR:", str(e))

        return Response(
            {"detail": "Account created. Please check your email to verify your account."},
            status=status.HTTP_201_CREATED,
        )
    

class VerifyEmailView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = VerifyEmailSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(
            {"detail": "Email verified successfully."},
            status=status.HTTP_200_OK,
        )
    

class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email", "").strip().lower()

        if not email:
            return Response(
                {"email": ["Email is required."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = User.objects.filter(email__iexact=email).first()

        if user:
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)

            reset_link = (
                f"{settings.FRONTEND_URL}/reset-password/"
                f"?uid={uid}&token={token}"
            )

            try:
                send_mail(
    subject="Reset your Finance Tracker password",
    message=(
        f"Hi {user.username},\n\n"
        "We received a request to reset your password.\n\n"
        f"Use this link to reset it:\n{reset_link}\n\n"
        "If you did not request this, you can ignore this email.\n\n"
        "Sincerely,\n"
        "Finance Tracker"
    ),
    from_email=settings.DEFAULT_FROM_EMAIL,
    recipient_list=[user.email],
    fail_silently=False,
    html_message=f"""
            <div style="margin:0; padding:24px; background-color:#faf7ef; font-family:Arial, sans-serif; color:#36403b;">
            <div style="
                max-width:600px;
                margin:0 auto;
                background:#ffffff;
                border-radius:12px;
                overflow:hidden;
                box-shadow:0 10px 30px rgba(0,0,0,0.08);
            ">
                
                <div style="
                background-color:#003d20;
                height:72px;
                border-radius:12px 12px 0 0;
                ">
                </div>

                <div style="padding:32px 28px; line-height:1.7; font-size:14px;">
                <p style="margin:0 0 20px 0;">
                    Hi <span style="color:#89a899;">{user.username}</span>,
                </p>

                <p style="margin:0 0 20px 0;">
                    We received a request to reset your password.
                </p>

                <p style="margin:0 0 24px 0;">
                    Use the button below to reset it:
                </p>

                <p style="margin:0 0 28px 0;">
                    <a
                    href="{reset_link}"
                    style="
                        display:inline-block;
                        background-color:#003d20;
                        color:#ffffff;
                        text-decoration:none;
                        padding:16px 16px;
                        border-radius:99px;
                        font-weight:600;
                    "
                    >
                    Reset Password
                    </a>
                </p>

                <p style="margin:0 0 20px 0; color:#6b7280; font-size:14px;">
                    If the button does not work, copy and paste this link into your browser:
                </p>

                <p style="margin:0 0 24px 0; word-break:break-word; font-size:14px; color:#003d20;">
                    {reset_link}
                </p>

                <p style="margin:0 0 8px 0;">
                    If you did not request this, you can ignore this email.
                </p>

                <p style="margin:24px 0 0 0;">
                    Sincerely,<br />
                    Finance Tracker
                </p>

                </div>
            </div>
            </div>
        """,
    )

            except Exception as e:
                print("EMAIL ERROR:", str(e))

        return Response(
            {
                "detail": "If an account with that email exists, a password reset link has been sent."
            },
            status=status.HTTP_200_OK,
        )
    

class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(
            {"detail": "Password has been reset successfully."},
            status=status.HTTP_200_OK,
        )
    

class LoginRateThrottle(AnonRateThrottle):
    rate = "5/min"

class RateLimitedTokenView(TokenObtainPairView):
    throttle_classes = [LoginRateThrottle]
    serializer_class = EmailOrUsernameTokenObtainPairSerializer