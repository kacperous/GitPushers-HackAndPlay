"""
Scraper for legal regulations from gov.pl Ministry of Health API
"""
import requests
import logging
from django.db import transaction

from .models import LegalRegulation
from .ai_generator import generate_regulation_title_and_description
from .date_parser import parse_and_generate_date

logger = logging.getLogger(__name__)


def scrape_legal_regulations():
    """
    Scrape legal regulations from Ministry of Health API
    
    Returns:
        dict: Results with new_records, duplicates_skipped, errors
    """
    api_url = "https://www.gov.pl/api/data/registers/search?pageId=21034488"
    
    results = {
        'new_records': 0,
        'duplicates_skipped': 0,
        'updated_records': 0,
        'errors': []
    }
    
    try:
        logger.info("🔍 Fetching legal regulations from gov.pl API...")
        print("🔍 Fetching legal regulations from gov.pl API...")
        
        response = requests.get(api_url, timeout=30)
        response.raise_for_status()
        
        regulations_data = response.json()
        
        logger.info(f"📊 Found {len(regulations_data)} regulations")
        print(f"📊 Found {len(regulations_data)} regulations")
        
        for idx, reg_data in enumerate(regulations_data, 1):
            try:
                # Extract data from API
                nr_w_wykazie = reg_data.get('Nr w Wykazie', '').strip()
                
                if not nr_w_wykazie:
                    logger.warning(f"Skipping regulation at index {idx}: missing Nr w Wykazie")
                    continue
                
                lp = reg_data.get('Lp.', '')
                podstawa_wydania = reg_data.get('Podstawa wydania', '')
                tytul_rozporzadzenia = reg_data.get('Tytuł rozporządzenia', '')
                przyczyny_rezygnacji = reg_data.get('Przyczyny rezygnacji z prac nad projektem', '')
                planowany_termin = reg_data.get('Planowany termin wydania / Publikacja w Dz. U', '')
                istota_rozwiazan = reg_data.get('Istota rozwiązań, które planuje się zawrzeć w projekcie:', '')
                osoba_odpowiedzialna = reg_data.get('Imię, nazwisko, stanowisko lub funkcja osoby odpowiedzialnej za opracowanie projektu:', '')
                przyczyna_potrzeba = reg_data.get('Przyczyna i potrzeba wprowadzenia rozwiązań, które planuje się zawrzeć w projekcie:', '')
                
                # Check if regulation already exists
                existing = LegalRegulation.objects.filter(nr_w_wykazie=nr_w_wykazie).first()
                
                if existing:
                    # Skip duplicates (could update here if needed)
                    results['duplicates_skipped'] += 1
                    print(f"⏭️  Skipping duplicate: {nr_w_wykazie}")
                    continue
                
                # Generate AI title and description
                logger.info(f"🤖 Generating AI content for: {nr_w_wykazie}")
                print(f"🤖 Generating AI for: {nr_w_wykazie}...")
                
                ai_title, ai_description = generate_regulation_title_and_description(
                    nr_w_wykazie=nr_w_wykazie,
                    podstawa_wydania=podstawa_wydania,
                    tytul_rozporzadzenia=tytul_rozporzadzenia,
                    istota_rozwiazan=istota_rozwiazan,
                    przyczyna_potrzeba=przyczyna_potrzeba,
                    przyczyny_rezygnacji=przyczyny_rezygnacji
                )
                
                # Parse and generate random date from quarter/semester
                planowany_data = parse_and_generate_date(planowany_termin)
                
                # Create new regulation
                regulation = LegalRegulation.objects.create(
                    lp=lp,
                    nr_w_wykazie=nr_w_wykazie,
                    podstawa_wydania=podstawa_wydania,
                    tytul_rozporzadzenia=tytul_rozporzadzenia,
                    przyczyny_rezygnacji=przyczyny_rezygnacji,
                    planowany_termin_wydania=planowany_termin,
                    planowany_termin_wydania_data=planowany_data,
                    istota_rozwiazan=istota_rozwiazan,
                    osoba_odpowiedzialna=osoba_odpowiedzialna,
                    przyczyna_potrzeba=przyczyna_potrzeba,
                    ai_tytul=ai_title,
                    ai_description=ai_description
                )
                
                results['new_records'] += 1
                ai_status = "✨ with AI" if ai_title and ai_description else "📝 no AI"
                print(f"✅ Created: {nr_w_wykazie} {ai_status}")
                
                # Progress indicator
                if results['new_records'] % 10 == 0:
                    print(f"  📊 Progress: {idx}/{len(regulations_data)} processed, {results['new_records']} created")
            
            except Exception as e:
                error_msg = f"Error processing regulation at index {idx}: {str(e)}"
                logger.error(error_msg)
                results['errors'].append(error_msg)
                print(f"❌ {error_msg}")
                continue
        
        print(f"\n📊 Scraping completed!")
        print(f"  ✅ New records: {results['new_records']}")
        print(f"  ⏭️  Duplicates skipped: {results['duplicates_skipped']}")
        print(f"  ❌ Errors: {len(results['errors'])}")
        
    except requests.RequestException as e:
        error_msg = f"Failed to fetch data from API: {str(e)}"
        logger.error(error_msg)
        results['errors'].append(error_msg)
        print(f"❌ {error_msg}")
    except Exception as e:
        error_msg = f"Unexpected error during scraping: {str(e)}"
        logger.error(error_msg)
        results['errors'].append(error_msg)
        print(f"❌ {error_msg}")
    
    return results

