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
        queryset = DrugEvent.objects.all()
        
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
    
    queryset = DrugEvent.objects.all()
    serializer_class = DrugEventSerializer
    permission_classes = [IsAuthenticated]


class RecentWithdrawalsView(APIView):
    """API endpoint to get recent drug withdrawals (last 10 days)"""
    
    permission_classes = [IsAuthenticated]
    
    @extend_schema(
        tags=['Drug Events'],
        responses={
            200: OpenApiResponse(description='Recent withdrawals retrieved successfully'),
        }
    )
    def get(self, request):
        ten_days_ago = timezone.now().date() - timedelta(days=10)
        
        recent_withdrawals = DrugEvent.objects.filter(
            Q(event_type=DrugEvent.EventType.WITHDRAWAL) | 
            Q(event_type=DrugEvent.EventType.SUSPENSION),
            publication_date__gte=ten_days_ago
        ).order_by('-publication_date')
        
        serializer = DrugEventSerializer(recent_withdrawals, many=True)
        
        return Response({
            'count': recent_withdrawals.count(),
            'period_days': 10,
            'events': serializer.data
        })


class ScrapeDataView(APIView):
    """API endpoint to trigger data scraping"""
    
    permission_classes = [IsAuthenticated]
    
    @extend_schema(
        tags=['Scraper'],
        responses={
            200: OpenApiResponse(description='Scraping completed successfully'),
            400: OpenApiResponse(description='Scraping failed'),
        }
    )
    def post(self, request):
        try:
            from .gif_scraper import scrape_rdg_data
            
            # Run the scraper
            result = scrape_rdg_data()
            
            return Response({
                'message': 'Scraping completed successfully',
                'new_records': result.get('new_records', 0),
                'duplicates_skipped': result.get('duplicates_skipped', 0),
                'total_records': result.get('total_records', 0),
                'errors': result.get('errors', [])
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': f'Scraping failed: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)