from django.urls import path
from . import views

app_name = 'regulations'

urlpatterns = [
    # List all regulations
    path('', views.LegalRegulationListView.as_view(), name='regulation-list'),
    
    # Get specific regulation by ID
    path('<int:pk>/', views.LegalRegulationDetailView.as_view(), name='regulation-detail'),
]

