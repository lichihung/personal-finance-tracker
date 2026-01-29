from django.contrib import admin
from .models import Category, Transaction

# Register your models here.
@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_disply = ("id", "name", "user", "created_at")
    search_fields = ("name", "user__username")
    list_filter = ("created_at",)

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ("id", "date", "type", "amount", "category", "user", "created_at")
    search_fields = ("description", "category__name", "user__username")
    list_filter = ("type", "date", "created_at")