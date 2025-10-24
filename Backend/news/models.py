from django.db import models


class MedicalNews(models.Model):
    title = models.CharField(max_length=500)
    description = models.TextField(blank=True, null=True)
    url = models.URLField(max_length=1000)
    source = models.CharField(max_length=200)
    published_at = models.DateTimeField()
    image_url = models.URLField(max_length=1000, blank=True, null=True)
    
    title_pl = models.CharField(max_length=500, blank=True, null=True)
    description_pl = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_translated = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-published_at']
        verbose_name = 'Medical News'
        verbose_name_plural = 'Medical News'
    
    def __str__(self):
        return f"{self.title[:50]} - {self.source}"
