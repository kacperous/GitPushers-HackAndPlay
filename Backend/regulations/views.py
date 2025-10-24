from rest_framework import generics
from rest_framework.permissions import AllowAny
from drf_spectacular.utils import extend_schema

from .models import LegalRegulation
from .serializers import LegalRegulationSerializer, LegalRegulationListSerializer


class LegalRegulationListView(generics.ListAPIView):
    """
    API endpoint to list all legal regulations
    Returns AI-generated title, description, legal basis, and planned date
    """
    
    serializer_class = LegalRegulationListSerializer
    permission_classes = [AllowAny]
    queryset = LegalRegulation.objects.all().order_by('-created_at')
    
    @extend_schema(
        description="Get list of all legal regulations with AI-generated titles and descriptions",
        responses={200: LegalRegulationListSerializer(many=True)}
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class LegalRegulationDetailView(generics.RetrieveAPIView):
    """
    API endpoint to get details of a specific legal regulation
    """
    
    queryset = LegalRegulation.objects.all()
    serializer_class = LegalRegulationSerializer
    permission_classes = [AllowAny]
    
    @extend_schema(
        description="Get detailed information about a specific legal regulation",
        responses={200: LegalRegulationSerializer}
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)
