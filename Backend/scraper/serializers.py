from rest_framework import serializers
from .models import DrugEvent


class DrugEventSerializer(serializers.ModelSerializer):
    """Serializer for DrugEvent model"""
    
    class Meta:
        model = DrugEvent
        fields = [
            'id', 'event_type', 'source', 'publication_date', 'decision_number',
            'drug_name', 'drug_strength', 'drug_form', 'marketing_authorisation_holder',
            'batch_number', 'expiry_date', 'description', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class DrugEventListSerializer(serializers.ModelSerializer):
    """Simplified serializer for list views"""
    
    class Meta:
        model = DrugEvent
        fields = [
            'id', 'event_type', 'source', 'publication_date', 'decision_number',
            'drug_name', 'drug_strength', 'drug_form', 'marketing_authorisation_holder', 'description'
        ]