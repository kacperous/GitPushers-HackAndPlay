from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from scraper.gif_scraper import scrape_rdg_data
from scraper.urpl_scraper import scrape_medicinal_products
from scraper.models import DrugEvent


class Command(BaseCommand):
    help = 'Run all scrapers (GIF + URPL) - for daily cron jobs'

    def add_arguments(self, parser):
        parser.add_argument(
            '--check-today',
            action='store_true',
            help='Skip scraping if records were already added today',
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('=' * 60))
        self.stdout.write(self.style.SUCCESS('🚀 Running ALL Scrapers (GIF + URPL)'))
        self.stdout.write(self.style.SUCCESS('=' * 60))
        
        # Check if scraping was already done today
        if options['check_today']:
            today = timezone.now().date()
            records_today = DrugEvent.objects.filter(created_at__date=today).count()
            
            if records_today > 0:
                self.stdout.write(
                    self.style.WARNING(
                        f'⏭️  Scraping already done today ({today}) - {records_today} records added.'
                    )
                )
                self.stdout.write('   Use command without --check-today to force scraping.')
                return
        
        total_new = 0
        total_duplicates = 0
        errors = []
        
        # 1. Run GIF Scraper (Withdrawals & Suspensions)
        self.stdout.write('\n📋 [1/2] Running GIF Scraper (Withdrawals & Suspensions)...')
        try:
            gif_result = scrape_rdg_data()
            total_new += gif_result['new_records']
            total_duplicates += gif_result['duplicates_skipped']
            
            self.stdout.write(
                self.style.SUCCESS(
                    f'   ✅ GIF: {gif_result["new_records"]} new, '
                    f'{gif_result["duplicates_skipped"]} duplicates'
                )
            )
            
            if gif_result['errors']:
                errors.extend([f'GIF: {e}' for e in gif_result['errors'][:2]])
                
        except Exception as e:
            error_msg = f'GIF scraper failed: {str(e)}'
            self.stdout.write(self.style.ERROR(f'   ❌ {error_msg}'))
            errors.append(error_msg)
        
        # 2. Run URPL Scraper (New Registrations)
        self.stdout.write('\n💊 [2/2] Running URPL Scraper (New Registrations)...')
        try:
            urpl_result = scrape_medicinal_products()
            total_new += urpl_result['new_records']
            total_duplicates += urpl_result['duplicates_skipped']
            
            self.stdout.write(
                self.style.SUCCESS(
                    f'   ✅ URPL: {urpl_result["new_records"]} new, '
                    f'{urpl_result["duplicates_skipped"]} duplicates'
                )
            )
            
            if urpl_result['errors']:
                errors.extend([f'URPL: {e}' for e in urpl_result['errors'][:2]])
                
        except Exception as e:
            error_msg = f'URPL scraper failed: {str(e)}'
            self.stdout.write(self.style.ERROR(f'   ❌ {error_msg}'))
            errors.append(error_msg)
        
        # Summary
        self.stdout.write('\n' + '=' * 60)
        self.stdout.write(self.style.SUCCESS('📊 SUMMARY'))
        self.stdout.write('=' * 60)
        self.stdout.write(f'   Total NEW records added: {total_new}')
        self.stdout.write(f'   Total duplicates skipped: {total_duplicates}')
        self.stdout.write(f'   Total records in database: {DrugEvent.objects.count()}')
        
        # Show recent activity
        recent_count = DrugEvent.objects.filter(
            publication_date__gte=timezone.now().date() - timedelta(days=10)
        ).count()
        self.stdout.write(f'   Records from last 10 days: {recent_count}')
        
        if errors:
            self.stdout.write(self.style.WARNING(f'\n⚠️  Errors encountered: {len(errors)}'))
            for error in errors[:3]:
                self.stdout.write(f'   - {error}')
        
        self.stdout.write('\n' + self.style.SUCCESS('🎉 All scrapers completed!'))

