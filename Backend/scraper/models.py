from django.db import models

class DrugEvent(models.Model):
    """
    Model for storing a single event related to a medicinal product,
    e.g., a batch withdrawal from GIF or a new drug registration from URPL.
    """


    class EventType(models.TextChoices):
        WITHDRAWAL = 'WITHDRAWAL', 'Withdrawal'
        SUSPENSION = 'SUSPENSION', 'Suspension'
        REGISTRATION = 'REGISTRATION', 'New Registration'

    class DataSource(models.TextChoices):
        GIF = 'GIF', 'Chief Pharmaceutical Inspectorate'
        URPL = 'URPL', 'Office for Registration of PL'

    event_type = models.CharField(
        max_length=20,
        choices=EventType.choices,
        help_text="The type of event (e.g., withdrawal, new registration)",
        db_index=True  
    )
    source = models.CharField(
        max_length=10,
        choices=DataSource.choices,
        help_text="The source of the data (GIF or URPL)",
        db_index=True
    )
    publication_date = models.DateField(
        help_text="Date the notice/decision was published or registration date",
        db_index=True
    )


    decision_number = models.CharField(
        max_length=255,
        null=True, 
        blank=True,
        help_text="Decision number (from GIF) or Permit number (from URPL)"
    )
    drug_name = models.CharField(
        max_length=255,
        help_text="Trade name of the medicinal product",
        db_index=True
    )
    drug_strength = models.CharField(
        max_length=100,
        null=True,  
        blank=True,
        help_text="Strength of the drug (e.g., 500 mg, 10 mg/ml)"
    )
    drug_form = models.CharField(
        max_length=100,
        null=True,  
        blank=True,
        help_text="Pharmaceutical form (e.g., Tablets, Solution)"
    )
    marketing_authorisation_holder = models.CharField(
        max_length=255,
        help_text="The company responsible for the drug"
    )
    
    # --- GIF-Specific Fields (nullable) ---

    batch_number = models.CharField(
        max_length=100,
        null=True,  # null=True because new drugs from URPL don't have a batch number
        blank=True,
        help_text="The batch (lot) number of the product",
        db_index=True
    )
    expiry_date = models.DateField(
        null=True,  # null=True because new drugs from URPL don't have an expiry date
        blank=True,
        help_text="Expiry date of the withdrawn/suspended batch"
    )
    
    # --- AI Generated Description ---
    
    description = models.TextField(
        null=True,
        blank=True,
        help_text="AI-generated professional description explaining the reason for the event (withdrawal/suspension/registration)"
    )

    # --- Tracking Fields (Best Practice) ---
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Timestamp when the record was added by the scraper"
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="Timestamp of the last record update"
    )

    # --- Model Configuration ---

    class Meta:
        ordering = ['-publication_date', '-created_at']  # Newest items always on top
        verbose_name = "Drug Event"
        verbose_name_plural = "Drug Events"
        # Prevents adding a duplicate of the same batch from the same decision
        constraints = [
            models.UniqueConstraint(
                fields=['decision_number', 'batch_number'], 
                name='unique_decision_batch'
            ),
            # Prevents adding the same drug with the same event type
            models.UniqueConstraint(
                fields=['event_type', 'drug_name', 'source'],
                name='unique_event_drug_source'
            )
        ]

    def __str__(self):
        # This is what you'll see in the Django admin panel
        if self.event_type == self.EventType.REGISTRATION:
            return f"[REGISTRATION] {self.drug_name} ({self.marketing_authorisation_holder})"
        else:
            batch = self.batch_number or "All batches"
            return f"[{self.event_type}] {self.drug_name} (Batch: {batch})"