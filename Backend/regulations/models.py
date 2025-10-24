from django.db import models


class LegalRegulation(models.Model):
    """Model for legal regulations from Ministry of Health"""
    
    # Original data from API
    lp = models.CharField(
        max_length=50,
        help_text="Numer pozycji (Lp.)"
    )
    nr_w_wykazie = models.CharField(
        max_length=100,
        db_index=True,
        help_text="Numer w wykazie (Nr w Wykazie)"
    )
    podstawa_wydania = models.TextField(
        help_text="Podstawa prawna wydania"
    )
    tytul_rozporzadzenia = models.TextField(
        blank=True,
        help_text="Tytuł rozporządzenia (oryginalny)"
    )
    przyczyny_rezygnacji = models.TextField(
        blank=True,
        help_text="Przyczyny rezygnacji z prac nad projektem"
    )
    planowany_termin_wydania = models.TextField(
        blank=True,
        help_text="Planowany termin wydania / Publikacja w Dz. U (tekst)"
    )
    planowany_termin_wydania_data = models.DateField(
        blank=True,
        null=True,
        help_text="Wygenerowana losowa data z kwartału planowanego terminu"
    )
    istota_rozwiazan = models.TextField(
        blank=True,
        help_text="Istota rozwiązań, które planuje się zawrzeć w projekcie"
    )
    osoba_odpowiedzialna = models.CharField(
        max_length=500,
        blank=True,
        help_text="Imię, nazwisko, stanowisko lub funkcja osoby odpowiedzialnej"
    )
    przyczyna_potrzeba = models.TextField(
        blank=True,
        help_text="Przyczyna i potrzeba wprowadzenia rozwiązań"
    )
    
    # AI Generated fields
    ai_tytul = models.CharField(
        max_length=500,
        blank=True,
        null=True,
        help_text="AI-generated title (concise and descriptive)"
    )
    ai_description = models.TextField(
        blank=True,
        null=True,
        help_text="AI-generated summary description"
    )
    
    # Tracking
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Legal Regulation'
        verbose_name_plural = 'Legal Regulations'
        indexes = [
            models.Index(fields=['nr_w_wykazie']),
            models.Index(fields=['lp']),
        ]
        # Unique constraint to prevent duplicates
        constraints = [
            models.UniqueConstraint(
                fields=['nr_w_wykazie'],
                name='unique_regulation_number'
            )
        ]
    
    def __str__(self):
        return f"{self.nr_w_wykazie}: {self.ai_tytul or self.tytul_rozporzadzenia[:50]}"
