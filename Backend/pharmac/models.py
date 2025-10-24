from django.db import models


class Drug(models.Model):
    """Model for medicinal products (drugs) from pharmacy database"""
    
    # Product information
    nazwa_produktu_leczniczego = models.CharField(
        max_length=500,
        db_index=True,
        help_text="Medicinal product name"
    )
    nazwa_powszechnie_stosowana = models.CharField(
        max_length=500,
        db_index=True,
        help_text="Common name / INN (International Nonproprietary Name)"
    )
    
    # Administration details
    droga_podania_gatunek_tkanka_okres_karencji = models.TextField(
        blank=True,
        null=True,
        help_text="Route of administration, species, tissue, withdrawal period"
    )
    
    # Strength and composition
    moc = models.TextField(
        blank=True,
        null=True,
        help_text="Strength/potency"
    )
    substancja_czynna = models.TextField(
        blank=True,
        null=True,
        db_index=True,
        help_text="Active substance(s)"
    )
    
    # Regulatory information
    numer_pozwolenia = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        db_index=True,
        help_text="Authorization number"
    )
    
    # Manufacturer/holder information
    podmiot_odpowiedzialny = models.CharField(
        max_length=500,
        blank=True,
        null=True,
        help_text="Marketing authorization holder"
    )
    nazwa_wytw_rcy = models.CharField(
        max_length=500,
        blank=True,
        null=True,
        help_text="Manufacturer name"
    )
    
    # Pricing and availability
    cena = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True,
        help_text="Price"
    )
    ilosc = models.IntegerField(
        blank=True,
        null=True,
        help_text="Quantity/amount"
    )
    
    # Tracking
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['nazwa_produktu_leczniczego']
        verbose_name = 'Drug'
        verbose_name_plural = 'Drugs'
        indexes = [
            models.Index(fields=['nazwa_produktu_leczniczego']),
            models.Index(fields=['nazwa_powszechnie_stosowana']),
            models.Index(fields=['substancja_czynna']),
        ]
    
    def __str__(self):
        return f"{self.nazwa_produktu_leczniczego} ({self.nazwa_powszechnie_stosowana})"
