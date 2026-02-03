from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework import status
from .models import Category, Transaction
from .serializers import CategorySerializer, TransactionSerializer, RegisterSerializer
from datetime import date
from django.utils.dateparse import parse_date

# Create your views here.
class CategoryViewSet(ModelViewSet):
    serializer_class = CategorySerializer

    def get_queryset(self):
        return Category.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

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
                qs = qs.filter(date__year=year, date__month=mon)
            except Exception:
                pass

        sort = self.request.query_params.get("sort")
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

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response({"username": user.username}, status=status.HTTP_201_CREATED)