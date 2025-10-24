from rest_framework import serializers
from .models import MedicalNews


class MedicalNewsSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicalNews
        fields = [
            'id',
            'title',
            'description',
            'url',
            'source',
            'published_at',
            'image_url',
            'title_pl',
            'description_pl',
            'is_translated',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at', 'is_translated']
