from django.shortcuts import render
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework import status
from rest_framework.exceptions import ValidationError
from .models import Category, Transaction
from .serializers import CategorySerializer, TransactionSerializer, RegisterSerializer
from datetime import date
from django.utils.dateparse import parse_date
from django.db import IntegrityError

# Create your views here.
class CategoryViewSet(ModelViewSet):
    serializer_class = CategorySerializer

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