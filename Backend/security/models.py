from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin


class UserManager(BaseUserManager):
    """Custom user manager for email-based authentication"""
    
    def create_user(self, email, password=None, **extra_fields):
        """Create and save a regular user with the given email and password"""
        if not email:
            raise ValueError('Email address is required')
        
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, password=None, **extra_fields):
        """Create and save a superuser with the given email and password"""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True')
        
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """Custom user model with email authentication"""
    
    ACCOUNT_TYPE_CHOICES = [
        ('doctor', 'Lekarz'),
        ('pharmacy', 'Apteka'),
    ]
    
    email = models.EmailField(
        verbose_name='Email',
        max_length=255,
        unique=True,
    )
    first_name = models.CharField(
        verbose_name='Imię',
        max_length=150,
    )
    last_name = models.CharField(
        verbose_name='Nazwisko',
        max_length=150,
    )
    account_type = models.CharField(
        verbose_name='Typ konta',
        max_length=20,
        choices=ACCOUNT_TYPE_CHOICES,
    )
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)
    
    objects = UserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name', 'account_type']
    
    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        db_table = 'users'
    
    def __str__(self):
        return self.email
    
    def get_full_name(self):
        """Return the first_name plus the last_name, with a space in between"""
        return f'{self.first_name} {self.last_name}'.strip()
    
    def get_short_name(self):
        """Return the short name for the user"""
        return self.first_name
