from celery import shared_task
from django.utils import timezone
from datetime import date, timedelta
import logging

from .gif_scraper import scrape_rdg_data
from .urpl_scraper import scrape_medicinal_products
from .models import DrugEvent

logger = logging.getLogger(__name__)


@shared_task(name='scraper.tasks.run_daily_scraping')
def run_daily_scraping():
    """
    Main task that runs both scrapers daily at 6 AM.
    Checks if scraping was already done today, if not - runs both scrapers.
    """
    logger.info("🚀 Starting daily scraping task...")
    
    # Check if scraping was already done today
    today = timezone.now().date()
    
    # Check if we have any records created today
    records_today = DrugEvent.objects.filter(created_at__date=today).exists()
    
    if records_today:
        logger.info(f"✅ Scraping already done today ({today}). Skipping...")
        return {
            'status': 'skipped',
            'message': f'Scraping already completed today ({today})',
            'date': str(today)
        }
    
    logger.info(f"📊 No records found for today ({today}). Starting scrapers...")
    
    results = {
        'date': str(today),
        'gif_scraper': {},
        'urpl_scraper': {},
        'total_new_records': 0,
        'total_duplicates': 0
    }
    
    # Run GIF scraper
    try:
        logger.info("📋 Running GIF scraper...")
        gif_result = scrape_rdg_data()
        results['gif_scraper'] = gif_result
        results['total_new_records'] += gif_result.get('new_records', 0)
        results['total_duplicates'] += gif_result.get('duplicates_skipped', 0)
        logger.info(f"✅ GIF scraper completed: {gif_result.get('new_records', 0)} new records")
    except Exception as e:
        logger.error(f"❌ GIF scraper failed: {str(e)}")
        results['gif_scraper'] = {'error': str(e)}
    
    # Run URPL scraper
    try:
        logger.info("💊 Running URPL scraper...")
        urpl_result = scrape_medicinal_products()
        results['urpl_scraper'] = urpl_result
        results['total_new_records'] += urpl_result.get('new_records', 0)
        results['total_duplicates'] += urpl_result.get('duplicates_skipped', 0)
        logger.info(f"✅ URPL scraper completed: {urpl_result.get('new_records', 0)} new records")
    except Exception as e:
        logger.error(f"❌ URPL scraper failed: {str(e)}")
        results['urpl_scraper'] = {'error': str(e)}
    
    logger.info(f"🎉 Daily scraping completed! Total new records: {results['total_new_records']}")
    
    return results


@shared_task(name='scraper.tasks.run_gif_scraper')
def run_gif_scraper():
    """Run only GIF scraper"""
    logger.info("📋 Running GIF scraper task...")
    try:
        result = scrape_rdg_data()
        logger.info(f"✅ GIF scraper completed: {result.get('new_records', 0)} new records")
        return result
    except Exception as e:
        logger.error(f"❌ GIF scraper failed: {str(e)}")
        raise


@shared_task(name='scraper.tasks.run_urpl_scraper')
def run_urpl_scraper():
    """Run only URPL scraper"""
    logger.info("💊 Running URPL scraper task...")
    try:
        result = scrape_medicinal_products()
        logger.info(f"✅ URPL scraper completed: {result.get('new_records', 0)} new records")
        return result
    except Exception as e:
        logger.error(f"❌ URPL scraper failed: {str(e)}")
        raise


@shared_task(name='scraper.tasks.check_and_run_scraping')
def check_and_run_scraping():
    """
    Check if scraping was done today, if not - run it.
    This can be called on application startup.
    """
    logger.info("🔍 Checking if scraping is needed...")
    return run_daily_scraping()

