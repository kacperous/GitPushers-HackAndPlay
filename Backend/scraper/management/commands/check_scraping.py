from django.core.management.base import BaseCommand
from django.utils import timezone
from scraper.tasks import check_and_run_scraping


class Command(BaseCommand):
    help = 'Check if daily scraping was done, if not - run it'

    def handle(self, *args, **options):
        self.stdout.write('🔍 Checking if daily scraping is needed...')
        self.stdout.write('=' * 50)
        
        try:
            # Run the check synchronously
            from scraper.models import DrugEvent
            
            today = timezone.now().date()
            records_today = DrugEvent.objects.filter(created_at__date=today).exists()
            
            if records_today:
                self.stdout.write(
                    self.style.SUCCESS(
                        f'✅ Scraping already done today ({today}). No action needed.'
                    )
                )
                return
            
            self.stdout.write(
                self.style.WARNING(
                    f'⚠️  No scraping records found for today ({today}).'
                )
            )
            
            # Queue the task
            self.stdout.write('📋 Queuing scraping task...')
            result = check_and_run_scraping.delay()
            
            self.stdout.write(
                self.style.SUCCESS(
                    f'✅ Scraping task queued successfully!\n'
                    f'   Task ID: {result.id}\n'
                    f'   You can monitor the task in Celery logs.'
                )
            )
            
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Error: {str(e)}')
            )
            raise

