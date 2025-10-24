from django.urls import path
from . import views

app_name = 'scraper'

urlpatterns = [
    path('drugs', views.DrugEventListView.as_view(), name='drug-events-list'),
    path('drugs/<int:pk>', views.DrugEventDetailView.as_view(), name='drug-event-detail'),
]