from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.password_validation import validate_password

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model"""
    
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'account_type', 'date_joined']
        read_only_fields = ['id', 'date_joined']


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    password2 = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
        label='Powtórz hasło'
    )
    
    class Meta:
        model = User
        fields = ['email', 'password', 'password2', 'first_name', 'last_name', 'account_type']
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
            'account_type': {'required': True},
        }
    
    def validate(self, attrs):
        """Validate that both passwords match"""
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({
                "password": "Hasła muszą być takie same."
            })
        return attrs
    
    def validate_email(self, value):
        """Validate that email is unique"""
        if User.objects.filter(email=value.lower()).exists():
            raise serializers.ValidationError("Użytkownik z tym adresem email już istnieje.")
        return value.lower()
    
    def validate_account_type(self, value):
        """Validate account type"""
        valid_types = ['doctor', 'pharmacy']
        if value not in valid_types:
            raise serializers.ValidationError(
                f"Nieprawidłowy typ konta. Dozwolone wartości: {', '.join(valid_types)}"
            )
        return value
    
    def create(self, validated_data):
        """Create a new user"""
        validated_data.pop('password2')
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            account_type=validated_data['account_type'],
        )
        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom JWT token serializer with additional user data"""
    
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
        # Add custom claims
        token['email'] = user.email
        token['first_name'] = user.first_name
        token['last_name'] = user.last_name
        token['account_type'] = user.account_type
        
        return token
    
    def validate(self, attrs):
        """Validate and return tokens with user data"""
        data = super().validate(attrs)
        
        # Add user data to response
        data['user'] = {
            'id': self.user.id,
            'email': self.user.email,
            'first_name': self.user.first_name,
            'last_name': self.user.last_name,
            'account_type': self.user.account_type,
        }
        
        return data


class LoginSerializer(serializers.Serializer):
    """Serializer for user login"""
    
    email = serializers.EmailField(required=True)
    password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )

