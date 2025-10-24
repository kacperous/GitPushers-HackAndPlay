from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from scraper.gif_scraper import scrape_rdg_data
from scraper.urpl_scraper import scrape_medicinal_products
from scraper.models import DrugEvent


class Command(BaseCommand):
    help = 'Run both RDG and Medicinal Products scrapers'

    def add_arguments(self, parser):
        parser.add_argument(
            '--show-details',
            action='store_true',
            help='Show detailed information about scraped data',
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('🚀 Starting All Scrapers...'))
        self.stdout.write('=' * 70)
        
        total_new_records = 0
        total_duplicates = 0
        all_errors = []
        
        # ===== SCRAPER 1: RDG (GIF) =====
        self.stdout.write('\n📋 [1/2] Running RDG Scraper (GIF - Withdrawals/Suspensions)...')
        self.stdout.write('-' * 70)
        
        try:
            rdg_result = scrape_rdg_data()
            
            self.stdout.write(
                self.style.SUCCESS(
                    f'✅ RDG Scraper completed!\n'
                    f'   - New records: {rdg_result["new_records"]}\n'
                    f'   - Duplicates skipped: {rdg_result["duplicates_skipped"]}'
                )
            )
            
            total_new_records += rdg_result['new_records']
            total_duplicates += rdg_result['duplicates_skipped']
            
            if rdg_result['errors']:
                self.stdout.write(
                    self.style.WARNING(f'⚠️  Errors: {len(rdg_result["errors"])}')
                )
                all_errors.extend(rdg_result['errors'])
                
        except Exception as e:
            error_msg = f'RDG Scraper failed: {str(e)}'
            self.stdout.write(self.style.ERROR(f'❌ {error_msg}'))
            all_errors.append(error_msg)
        
        # ===== SCRAPER 2: Medicinal Products (URPL) =====
        self.stdout.write('\n💊 [2/2] Running Medicinal Products Scraper (URPL - Registrations)...')
        self.stdout.write('-' * 70)
        
        try:
            medicinal_result = scrape_medicinal_products()
            
            self.stdout.write(
                self.style.SUCCESS(
                    f'✅ Medicinal Products Scraper completed!\n'
                    f'   - New records: {medicinal_result["new_records"]}\n'
                    f'   - Duplicates skipped: {medicinal_result["duplicates_skipped"]}'
                )
            )
            
            total_new_records += medicinal_result['new_records']
            total_duplicates += medicinal_result['duplicates_skipped']
            
            if medicinal_result['errors']:
                self.stdout.write(
                    self.style.WARNING(f'⚠️  Errors: {len(medicinal_result["errors"])}')
                )
                all_errors.extend(medicinal_result['errors'])
                
        except Exception as e:
            error_msg = f'Medicinal Products Scraper failed: {str(e)}'
            self.stdout.write(self.style.ERROR(f'❌ {error_msg}'))
            all_errors.append(error_msg)
        
        # ===== SUMMARY =====
        self.stdout.write('\n' + '=' * 70)
        self.stdout.write(self.style.SUCCESS('📊 SCRAPING SUMMARY'))
        self.stdout.write('=' * 70)
        
        self.stdout.write(
            self.style.SUCCESS(
                f'✨ Total new records added: {total_new_records}\n'
                f'⏭️  Total duplicates skipped: {total_duplicates}\n'
                f'📚 Total records in database: {DrugEvent.objects.count()}'
            )
        )
        
        # Show breakdown by source
        gif_count = DrugEvent.objects.filter(source=DrugEvent.DataSource.GIF).count()
        urpl_count = DrugEvent.objects.filter(source=DrugEvent.DataSource.URPL).count()
        
        self.stdout.write(
            f'\n📂 Records by source:\n'
            f'   - GIF (Withdrawals/Suspensions): {gif_count}\n'
            f'   - URPL (Registrations): {urpl_count}'
        )
        
        # Show recent records count
        recent_count = DrugEvent.objects.filter(
            publication_date__gte=timezone.now().date() - timedelta(days=10)
        ).count()
        self.stdout.write(f'\n🕐 Recent records (last 10 days): {recent_count}')
        
        # Show errors if any
        if all_errors:
            self.stdout.write(
                self.style.WARNING(f'\n⚠️  Total errors encountered: {len(all_errors)}')
            )
            for i, error in enumerate(all_errors[:5], 1):  # Show first 5 errors
                self.stdout.write(f'   {i}. {error}')
            if len(all_errors) > 5:
                self.stdout.write(f'   ... and {len(all_errors) - 5} more')
        
        # Show sample records if requested
        if options['show_details'] and total_new_records > 0:
            self.stdout.write('\n🔍 Recent drug events (sample):')
            self.stdout.write('-' * 70)
            
            recent_events = DrugEvent.objects.order_by('-publication_date', '-created_at')[:10]
            
            for event in recent_events:
                source_icon = '🚫' if event.source == DrugEvent.DataSource.GIF else '✅'
                self.stdout.write(
                    f'   {source_icon} {event.drug_name} ({event.event_type}) - {event.publication_date} [{event.source}]'
                )
        
        self.stdout.write('\n' + '=' * 70)
        self.stdout.write(self.style.SUCCESS('🎉 All scrapers completed!'))
        self.stdout.write('=' * 70 + '\n')

