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
        queryset=Category.objects.all(),
        write_only=True,
    )
    category = CategorySerializer(read_only=True)

    def validate_category_id(self, category):
        request = self.context["request"]
        if category.user_id != request.user.id:
            raise serializers.ValidationError("Invalid category.")
        return category
    
    class Meta:
        model = Transaction
        fields = ["id", "date", "type", "amount", "description", "category", "category_id", "created_at",]
        read_only_fields = ["id", "created_at", "category"]

User = get_user_model()
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ["username", "password"]

    def create(self, validated_data):
        return User.objects.create_user(
            username = validated_data["username"],
            password = validated_data["password"],
        )