"""
Django management command to scrape legal regulations
"""
from django.core.management.base import BaseCommand
from regulations.scraper import scrape_legal_regulations


class Command(BaseCommand):
    help = 'Scrape legal regulations from Ministry of Health API and generate AI titles/descriptions'

    def handle(self, *args, **options):
        self.stdout.write("🚀 Starting legal regulations scraper...")
        
        result = scrape_legal_regulations()
        
        self.stdout.write("\n" + "="*50)
        self.stdout.write(self.style.SUCCESS("✅ Scraping completed!"))
        self.stdout.write(f"  New records: {result['new_records']}")
        self.stdout.write(f"  Duplicates skipped: {result['duplicates_skipped']}")
        self.stdout.write(f"  Errors: {len(result['errors'])}")
        
        if result['errors']:
            self.stdout.write("\n⚠️  Errors encountered:")
            for error in result['errors'][:5]:
                self.stdout.write(f"  - {error}")
            if len(result['errors']) > 5:
                self.stdout.write(f"  ... and {len(result['errors']) - 5} more")

