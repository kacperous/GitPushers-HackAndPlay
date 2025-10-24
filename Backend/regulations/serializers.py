from rest_framework import serializers
from .models import LegalRegulation


class LegalRegulationSerializer(serializers.ModelSerializer):
    """Serializer for Legal Regulation with all fields"""
    
    class Meta:
        model = LegalRegulation
        fields = [
            'id',
            'nr_w_wykazie',
            'podstawa_wydania',
            'ai_tytul',
            'ai_description',
            'planowany_termin_wydania_data',
            'lp',
            'tytul_rozporzadzenia',
            'przyczyny_rezygnacji',
            'planowany_termin_wydania',
            'istota_rozwiazan',
            'osoba_odpowiedzialna',
            'przyczyna_potrzeba',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class LegalRegulationListSerializer(serializers.ModelSerializer):
    """Simplified serializer for list views - only AI generated fields and key info"""
    
    class Meta:
        model = LegalRegulation
        fields = [
            'id',
            'nr_w_wykazie',
            'podstawa_wydania',
            'ai_tytul',
            'ai_description',
            'planowany_termin_wydania_data',
            'created_at'
        ]

