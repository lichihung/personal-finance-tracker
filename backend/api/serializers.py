from rest_framework import serializers
from .models import Category, Transaction
from django.contrib.auth import get_user_model

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "created_at"]
        read_only_fields = ["id", "created_at"]


class TransactionSerializer(serializers.ModelSerializer):
    category_id = serializers.PrimaryKeyRelatedField(
        source="category",
        queryset=Category.objects.none(),
        write_only=True,
    )
    category = CategorySerializer(read_only=True)

    class Meta:
        model = Transaction
        fields = [
            "id",
            "date",
            "type",
            "amount",
            "description",
            "category",
            "category_id",
            "created_at",
        ]
        read_only_fields = ["id", "created_at", "category"]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get("request")
        if request and request.user and request.user.is_authenticated:
            self.fields["category_id"].queryset = Category.objects.filter(user=request.user)


User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ["username", "password"]

    def create(self, validated_data):
        return User.objects.create_user(
            username=validated_data["username"],
            password=validated_data["password"],
        )