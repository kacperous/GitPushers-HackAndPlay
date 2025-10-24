from django.urls import path
from . import views

app_name = 'scraper'

urlpatterns = [
    path('events/', views.DrugEventListView.as_view(), name='drug-events-list'),
    path('events/<int:pk>/', views.DrugEventDetailView.as_view(), name='drug-event-detail'),
    path('recent-withdrawals/', views.RecentWithdrawalsView.as_view(), name='recent-withdrawals'),
    path('scrape/', views.ScrapeDataView.as_view(), name='scrape-data'),
]