from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.db.models import Q
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiResponse

from .models import Drug
from .serializers import DrugSerializer


class DrugListView(generics.ListAPIView):
    """
    API endpoint to list all drugs
    
    Supports filtering by:
    - product name (nazwa_produktu_leczniczego)
    - common name (nazwa_powszechnie_stosowana)
    - active substance (substancja_czynna)
    """
    
    serializer_class = DrugSerializer
    permission_classes = [AllowAny]
    
    @extend_schema(
        parameters=[
            OpenApiParameter(
                name='product_name',
                description='Search by product name (partial match, case-insensitive)',
                required=False,
                type=str
            ),
            OpenApiParameter(
                name='common_name',
                description='Search by common name (partial match, case-insensitive)',
                required=False,
                type=str
            ),
            OpenApiParameter(
                name='active_substance',
                description='Search by active substance (partial match, case-insensitive)',
                required=False,
                type=str
            ),
        ],
        responses={
            200: DrugSerializer(many=True)
        }
    )
    def get_queryset(self):
        queryset = Drug.objects.all().order_by('id')
        
        # Filter by product name (partial match, case-insensitive)
        product_name = self.request.query_params.get('product_name')
        if product_name:
            queryset = queryset.filter(
                nazwa_produktu_leczniczego__icontains=product_name
            )
        
        # Filter by common name (partial match, case-insensitive)
        common_name = self.request.query_params.get('common_name')
        if common_name:
            queryset = queryset.filter(
                nazwa_powszechnie_stosowana__icontains=common_name
            )
        
        # Filter by active substance (partial match, case-insensitive)
        active_substance = self.request.query_params.get('active_substance')
        if active_substance:
            queryset = queryset.filter(
                substancja_czynna__icontains=active_substance
            )
        
        return queryset


class DrugDetailView(generics.RetrieveAPIView):
    """API endpoint to get details of a specific drug by ID"""
    
    queryset = Drug.objects.all().order_by('id')
    serializer_class = DrugSerializer
    permission_classes = [AllowAny]


class DrugSearchByNameView(generics.GenericAPIView):
    """
    API endpoint to search drugs by product name (partial match)
    
    Example POST body: {"name": "recordati"}
    """
    
    serializer_class = DrugSerializer
    permission_classes = [AllowAny]
    
    @extend_schema(
        request={
            'application/json': {
                'type': 'object',
                'properties': {
                    'name': {
                        'type': 'string',
                        'description': 'Search query for product name (partial match, case-insensitive)'
                    }
                },
                'required': ['name']
            }
        },
        responses={
            200: DrugSerializer(many=True),
            400: OpenApiResponse(description='Bad request - missing name parameter')
        }
    )
    def post(self, request):
        search_query = request.data.get('name', '')
        
        if not search_query:
            return Response(
                {'error': 'Parameter "name" is required'},
                status=400
            )
        
        # Search in product name, common name, and manufacturer
        queryset = Drug.objects.filter(
            Q(nazwa_produktu_leczniczego__icontains=search_query) |
            Q(nazwa_powszechnie_stosowana__icontains=search_query) |
            Q(podmiot_odpowiedzialny__icontains=search_query)
        ).order_by('nazwa_produktu_leczniczego')
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class DrugSearchBySubstanceView(generics.GenericAPIView):
    """
    API endpoint to search drugs by active substance (partial match)
    
    Example POST body: {"substance": "pasireotidum"}
    """
    
    serializer_class = DrugSerializer
    permission_classes = [AllowAny]
    
    @extend_schema(
        request={
            'application/json': {
                'type': 'object',
                'properties': {
                    'substance': {
                        'type': 'string',
                        'description': 'Search query for active substance (partial match, case-insensitive)'
                    }
                },
                'required': ['substance']
            }
        },
        responses={
            200: DrugSerializer(many=True),
            400: OpenApiResponse(description='Bad request - missing substance parameter')
        }
    )
    def post(self, request):
        search_query = request.data.get('substance', '')
        
        if not search_query:
            return Response(
                {'error': 'Parameter "substance" is required'},
                status=400
            )
        
        # Search in active substance field
        queryset = Drug.objects.filter(
            substancja_czynna__icontains=search_query
        ).order_by('nazwa_produktu_leczniczego')
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
