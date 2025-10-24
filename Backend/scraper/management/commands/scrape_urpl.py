from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from scraper.urpl_scraper import scrape_medicinal_products
from scraper.models import DrugEvent


class Command(BaseCommand):
    help = 'Scrape URPL data (new drug registrations) from medicinal products API'

    def add_arguments(self, parser):
        parser.add_argument(
            '--show-details',
            action='store_true',
            help='Show detailed information about scraped data',
        )

    def handle(self, *args, **options):
        self.stdout.write('🚀 Starting URPL Scraper (New Registrations)...')
        self.stdout.write('=' * 50)
        
        try:
            # Run the scraper
            result = scrape_medicinal_products()
            
            # Show results
            self.stdout.write(
                self.style.SUCCESS(
                    f'✅ Scraping completed successfully!\n'
                    f'   - New records: {result["new_records"]}\n'
                    f'   - Duplicates skipped: {result["duplicates_skipped"]}\n'
                    f'   - Total records in database: {DrugEvent.objects.count()}'
                )
            )
            
            if result['errors']:
                self.stdout.write(
                    self.style.WARNING(f'⚠️  Errors encountered: {len(result["errors"])}')
                )
                for error in result['errors'][:3]:  # Show first 3 errors
                    self.stdout.write(f'   - {error}')
            
            # Show recent records count
            recent_count = DrugEvent.objects.filter(
                source=DrugEvent.DataSource.URPL,
                publication_date__gte=timezone.now().date() - timedelta(days=10)
            ).count()
            self.stdout.write(f'   - URPL records (last 10 days): {recent_count}')
            
            # Show sample records if requested
            if options['show_details'] and result['new_records'] > 0:
                self.stdout.write('\n🔍 Recent URPL medicinal products:')
                recent_events = DrugEvent.objects.filter(
                    source=DrugEvent.DataSource.URPL,
                    publication_date__gte=timezone.now().date() - timedelta(days=10)
                ).order_by('-publication_date')[:5]
                
                for event in recent_events:
                    self.stdout.write(
                        f'   - {event.drug_name} ({event.event_type}) - {event.publication_date}'
                    )
            
            self.stdout.write('\n🎉 URPL Scraping completed!')
            
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Scraping failed: {str(e)}')
            )
            raise

