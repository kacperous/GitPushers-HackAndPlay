from django.urls import path
from . import views

app_name = 'pharmac'

urlpatterns = [
    # List all drugs with optional filters
    path('drugs/', views.DrugListView.as_view(), name='drug-list'),
    
    # Get specific drug by ID
    path('drugs/<int:pk>/', views.DrugDetailView.as_view(), name='drug-detail'),
    
    # Search by name (product name, common name, or manufacturer)
    path('search/name/', views.DrugSearchByNameView.as_view(), name='drug-search-by-name'),
    
    # Search by active substance
    path('search/substance/', views.DrugSearchBySubstanceView.as_view(), name='drug-search-by-substance'),
]

