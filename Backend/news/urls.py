from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MedicalNewsViewSet

router = DefaultRouter()
router.register(r'medical', MedicalNewsViewSet, basename='medical-news')

urlpatterns = [
    path('', include(router.urls)),
]
