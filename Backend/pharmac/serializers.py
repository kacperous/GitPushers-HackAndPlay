from rest_framework import serializers
from .models import Drug


class DrugSerializer(serializers.ModelSerializer):
    """Serializer for Drug model"""
    
    class Meta:
        model = Drug
        fields = [
            'id',
            'nazwa_produktu_leczniczego',
            'nazwa_powszechnie_stosowana',
            'droga_podania_gatunek_tkanka_okres_karencji',
            'moc',
            'substancja_czynna',
            'numer_pozwolenia',
            'podmiot_odpowiedzialny',
            'nazwa_wytw_rcy',
            'cena',
            'ilosc',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

