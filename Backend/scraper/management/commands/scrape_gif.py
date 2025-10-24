from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from scraper.gif_scraper import scrape_rdg_data
from scraper.models import DrugEvent


class Command(BaseCommand):
    help = 'Scrape GIF data (drug withdrawals and suspensions) from RDG website'

    def add_arguments(self, parser):
        parser.add_argument(
            '--show-details',
            action='store_true',
            help='Show detailed information about scraped data',
        )

    def handle(self, *args, **options):
        self.stdout.write('🚀 Starting GIF Scraper (Withdrawals & Suspensions)...')
        self.stdout.write('=' * 50)
        
        try:
            # Run the scraper
            result = scrape_rdg_data()
            
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
                source=DrugEvent.DataSource.GIF,
                publication_date__gte=timezone.now().date() - timedelta(days=310)
            ).count()
            self.stdout.write(f'   - GIF records (last 10 days): {recent_count}')
            
            # Show sample records if requested
            if options['show_details'] and result['new_records'] > 0:
                self.stdout.write('\n🔍 Recent GIF drug events:')
                recent_events = DrugEvent.objects.filter(
                    source=DrugEvent.DataSource.GIF,
                    publication_date__gte=timezone.now().date() - timedelta(days=10)
                ).order_by('-publication_date')[:5]
                
                for event in recent_events:
                    self.stdout.write(
                        f'   - {event.drug_name} ({event.event_type}) - {event.publication_date}'
                    )
            
            self.stdout.write('\n🎉 GIF Scraping completed!')
            
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Scraping failed: {str(e)}')
            )
            raise

