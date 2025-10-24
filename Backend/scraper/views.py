from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from datetime import timedelta
from drf_spectacular.utils import extend_schema, OpenApiResponse
from django.db.models import Q

from .models import DrugEvent
from .serializers import DrugEventSerializer, DrugEventListSerializer


class DrugEventListView(generics.ListAPIView):
    """API endpoint to list drug events"""
    
    serializer_class = DrugEventListSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = DrugEvent.objects.all().order_by('id')
        
        # Filter by event type if provided
        event_type = self.request.query_params.get('event_type')
        if event_type:
            queryset = queryset.filter(event_type=event_type)
        
        # Filter by source if provided
        source = self.request.query_params.get('source')
        if source:
            queryset = queryset.filter(source=source)        
        # Filter by recent events (last 10 days)
        recent_only = self.request.query_params.get('recent_only')
        if recent_only and recent_only.lower() == 'true':
            ten_days_ago = timezone.now().date() - timedelta(days=10)
            queryset = queryset.filter(publication_date__gte=ten_days_ago)
        
        return queryset


class DrugEventDetailView(generics.RetrieveAPIView):
    """API endpoint to get details of a specific drug event"""
    
    queryset = DrugEvent.objects.all().order_by('id')
    serializer_class = DrugEventSerializer
    permission_classes = [IsAuthenticated]