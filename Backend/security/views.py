from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from drf_spectacular.utils import extend_schema, OpenApiResponse

from .serializers import (
    RegisterSerializer,
    UserSerializer,
    CustomTokenObtainPairSerializer,
    LoginSerializer
)

User = get_user_model()


@extend_schema(
    tags=['Authentication'],
    request=RegisterSerializer,
    responses={
        201: OpenApiResponse(
            response=UserSerializer,
            description='User successfully registered'
        ),
        400: OpenApiResponse(description='Bad request - validation errors'),
    }
)
class RegisterView(generics.CreateAPIView):
    """
    API endpoint for user registration.
    
    Creates a new user account with email, password, first_name, last_name, and account_type.
    Returns JWT tokens upon successful registration.
    """
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate JWT tokens for the new user
        refresh = RefreshToken.for_user(user)
        
        # Add custom claims to tokens
        refresh['email'] = user.email
        refresh['first_name'] = user.first_name
        refresh['last_name'] = user.last_name
        refresh['account_type'] = user.account_type
        
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            'message': 'Użytkownik został pomyślnie zarejestrowany.'
        }, status=status.HTTP_201_CREATED)


@extend_schema(
    tags=['Authentication'],
    request=LoginSerializer,
    responses={
        200: OpenApiResponse(
            description='Successfully logged in'
        ),
        401: OpenApiResponse(description='Invalid credentials'),
    }
)
class LoginView(TokenObtainPairView):
    """
    API endpoint for user login.
    
    Authenticates user with email and password.
    Returns JWT access and refresh tokens upon successful authentication.
    """
    permission_classes = [AllowAny]
    serializer_class = CustomTokenObtainPairSerializer


@extend_schema(
    tags=['Authentication'],
    request=None,
    responses={
        200: OpenApiResponse(description='Successfully logged out'),
        400: OpenApiResponse(description='Bad request'),
    }
)
class LogoutView(APIView):
    """
    API endpoint for user logout.
    
    Blacklists the refresh token to invalidate it.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh_token')
            if not refresh_token:
                return Response(
                    {'error': 'Refresh token jest wymagany.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            token = RefreshToken(refresh_token)
            token.blacklist()
            
            return Response(
                {'message': 'Pomyślnie wylogowano.'},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


@extend_schema(
    tags=['User'],
    responses={
        200: UserSerializer,
        401: OpenApiResponse(description='Unauthorized'),
    }
)
class CurrentUserView(generics.RetrieveAPIView):
    """
    API endpoint to get current authenticated user's information.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer
    
    def get_object(self):
        return self.request.user


@extend_schema(
    tags=['User'],
    request=UserSerializer,
    responses={
        200: UserSerializer,
        401: OpenApiResponse(description='Unauthorized'),
    }
)
class UpdateUserView(generics.UpdateAPIView):
    """
    API endpoint to update current authenticated user's information.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer
    
    def get_object(self):
        return self.request.user
