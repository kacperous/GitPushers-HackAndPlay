"""
Django management command to import drugs from JSON file
"""
import json
from django.core.management.base import BaseCommand
from django.db import transaction
from pharmac.models import Drug


class Command(BaseCommand):
    help = 'Import drugs from JSON file (pharmac/initial/drugs.json)'

    def handle(self, *args, **options):
        json_file_path = 'pharmac/initial/drugs.json'
        
        self.stdout.write(f"📁 Loading data from {json_file_path}...")
        
        try:
            with open(json_file_path, 'r', encoding='utf-8') as f:
                drugs_data = json.load(f)
            
            self.stdout.write(f"✅ Loaded {len(drugs_data)} drugs from JSON")
            
            created_count = 0
            updated_count = 0
            skipped_count = 0
            errors = []
            
            with transaction.atomic():
                for idx, drug_data in enumerate(drugs_data, 1):
                    try:
                        # Get or create drug
                        # Use nazwa_produktu_leczniczego + substancja_czynna as unique identifier
                        drug, created = Drug.objects.get_or_create(
                            nazwa_produktu_leczniczego=drug_data.get('nazwa_produktu_leczniczego', ''),
                            substancja_czynna=drug_data.get('substancja_czynna', ''),
                            defaults={
                                'nazwa_powszechnie_stosowana': drug_data.get('nazwa_powszechnie_stosowana', ''),
                                'droga_podania_gatunek_tkanka_okres_karencji': drug_data.get('droga_podania_gatunek_tkanka_okres_karencji'),
                                'moc': drug_data.get('moc'),
                                'numer_pozwolenia': drug_data.get('numer_pozwolenia'),
                                'podmiot_odpowiedzialny': drug_data.get('podmiot_odpowiedzialny'),
                                'nazwa_wytw_rcy': drug_data.get('nazwa_wytw_rcy'),
                                'cena': drug_data.get('cena'),
                                'ilosc': drug_data.get('ilość'),  # Note: "ilość" in JSON, "ilosc" in model
                            }
                        )
                        
                        if created:
                            created_count += 1
                            if created_count % 100 == 0:
                                self.stdout.write(f"  Processed {idx}/{len(drugs_data)} drugs... ({created_count} created)")
                        else:
                            skipped_count += 1
                    
                    except Exception as e:
                        error_msg = f"Error processing drug at index {idx}: {str(e)}"
                        self.stdout.write(self.style.ERROR(f"❌ {error_msg}"))
                        errors.append(error_msg)
                        continue
            
            # Summary
            self.stdout.write("\n" + "="*50)
            self.stdout.write(self.style.SUCCESS(f"✅ Import completed!"))
            self.stdout.write(f"  Created: {created_count}")
            self.stdout.write(f"  Skipped (duplicates): {skipped_count}")
            self.stdout.write(f"  Errors: {len(errors)}")
            self.stdout.write(f"  Total in database: {Drug.objects.count()}")
            
            if errors:
                self.stdout.write("\n⚠️  Errors:")
                for error in errors[:10]:  # Show first 10 errors
                    self.stdout.write(f"  - {error}")
                if len(errors) > 10:
                    self.stdout.write(f"  ... and {len(errors) - 10} more errors")
        
        except FileNotFoundError:
            self.stdout.write(self.style.ERROR(f"❌ File not found: {json_file_path}"))
        except json.JSONDecodeError as e:
            self.stdout.write(self.style.ERROR(f"❌ Invalid JSON: {str(e)}"))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"❌ Unexpected error: {str(e)}"))

