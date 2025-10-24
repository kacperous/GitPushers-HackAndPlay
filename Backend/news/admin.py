from django.contrib import admin
from .models import MedicalNews


@admin.register(MedicalNews)
class MedicalNewsAdmin(admin.ModelAdmin):
    list_display = ('title', 'source', 'published_at', 'is_translated', 'created_at')
    list_filter = ('is_translated', 'source', 'published_at')
    search_fields = ('title', 'description', 'title_pl', 'description_pl')
    readonly_fields = ('created_at', 'updated_at')
    date_hierarchy = 'published_at'
    
    fieldsets = (
        ('Original Content', {
            'fields': ('title', 'description', 'url', 'source', 'published_at', 'image_url')
        }),
        ('Polish Translation', {
            'fields': ('title_pl', 'description_pl', 'is_translated')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
