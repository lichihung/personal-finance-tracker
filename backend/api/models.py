from django.db import models
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model

# Create your models here.
class Category(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="categories")
    name = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "name")
        ordering = ["name"]
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name
    
class Transaction(models.Model):
    TYPE_CHOICES = (
        ("income", "Income"),
        ("expense", "Expense"),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="transactions")
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name="transactions")
    date = models.DateField()
    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    description = models.CharField(max_length=200, blank=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["date", "id"]

    def __str__(self):
        return f"{self.type} {self.amount} on {self.date}"
    
class UserSecurity(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    email_verified = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.username} security"
    
User = get_user_model()

@receiver(post_save, sender=User)
def create_user_security(sender, instance, created, **kwargs):
    if created:
        UserSecurity.objects.create(user=instance)