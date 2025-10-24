from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import MedicalNews
from .serializers import MedicalNewsSerializer


class MedicalNewsViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet do pobierania newsów medycznych.
    Tylko odczyt (GET) - newsy są dodawane przez scheduled task.
    """
    queryset = MedicalNews.objects.all()
    serializer_class = MedicalNewsSerializer
    permission_classes = [permissions.AllowAny]  # Możesz zmienić na IsAuthenticated
    
    def get_queryset(self):
        queryset = MedicalNews.objects.all()
        
        # Filtrowanie tylko przetłumaczonych newsów
        only_translated = self.request.query_params.get('translated', None)
        if only_translated == 'true':
            queryset = queryset.filter(is_translated=True)
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def latest(self, request):
        """Endpoint do pobrania najnowszych newsów"""
        limit = int(request.query_params.get('limit', 10))
        news = self.get_queryset()[:limit]
        serializer = self.get_serializer(news, many=True)
        return Response(serializer.data)
