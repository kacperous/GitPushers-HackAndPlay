import requests
from bs4 import BeautifulSoup
import json
from datetime import datetime, timedelta
from django.utils import timezone
from django.db import transaction
import logging

from .models import DrugEvent

logger = logging.getLogger(__name__)


def scrape_rdg_data():
    """
    Scrapes data from RDG website and saves to database with duplicate checking
    Returns dict with scraping results
    """
    base_url = "https://rdg.ezdrowie.gov.pl/"
    results = {
        'new_records': 0,
        'duplicates_skipped': 0,
        'errors': []
    }
    
    try:
        print("🔍 Scraping data from RDG website...")
        
        # Get the main page
        response = requests.get(base_url, timeout=30)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Find the table with decisions
        table = soup.find('table', class_='table-decisions')
        if not table:
            table = soup.find('table')
        
        if not table:
            raise Exception("Could not find decisions table on the page")
        
        # Extract data from table rows
        tbody = table.find('tbody')
        if not tbody:
            raise Exception("Could not find table body")
        
        rows = tbody.find_all('tr')
        new_records = 0
        duplicates_skipped = 0
        
        # Calculate date 10 days ago
        ten_days_ago = timezone.now().date() - timedelta(days=10)
        
        with transaction.atomic():
            for row in rows:
                try:
                    cells = row.find_all('td')
                    if len(cells) < 8:
                        continue
                    
                    # Extract data from cells
                    decision_date_str = cells[0].get_text(strip=True)
                    decision_number = cells[1].get_text(strip=True)
                    drug_name_cell = cells[2]
                    strength_cell = cells[3]
                    responsible_entity_cell = cells[4]
                    decision_type_cell = cells[5]
                    
                    # Handle multi-row cells
                    drug_names = extract_multi_row_data(drug_name_cell)
                    strengths = extract_multi_row_data(strength_cell)
                    responsible_entities = extract_multi_row_data(responsible_entity_cell)
                    decision_types = extract_multi_row_data(decision_type_cell)
                    
                    # Parse decision date
                    try:
                        decision_date = datetime.strptime(decision_date_str, '%Y-%m-%d').date()
                    except ValueError:
                        print(f"⚠️  Could not parse date: {decision_date_str}")
                        continue
                    
                    # Check if decision is from last 10 days
                    if decision_date < ten_days_ago:
                        continue
                    
                    # Process each drug entry
                    for i, drug_name in enumerate(drug_names):
                        if not drug_name or drug_name == '-':
                            continue
                            
                        strength = strengths[i] if i < len(strengths) else ''
                        responsible_entity = responsible_entities[i] if i < len(responsible_entities) else ''
                        decision_type_str = decision_types[i] if i < len(decision_types) else ''
                        
                        # Clean up HTML entities
                        drug_name = clean_html_entities(drug_name)
                        strength = clean_html_entities(strength)
                        responsible_entity = clean_html_entities(responsible_entity)
                        decision_type_str = clean_html_entities(decision_type_str)
                        
                        # Map decision type
                        event_type = map_decision_type(decision_type_str)
                        
                        # Check for duplicates
                        if DrugEvent.objects.filter(
                            event_type=event_type,
                            drug_name=drug_name,
                            decision_number=decision_number,
                            publication_date=decision_date
                        ).exists():
                            print(f"⏭️  Skipping duplicate: {drug_name} - {decision_type_str}")
                            duplicates_skipped += 1
                            continue
                        
                        # Create new DrugEvent
                        try:
                            drug_event = DrugEvent.objects.create(
                                event_type=event_type,
                                source=DrugEvent.DataSource.GIF,
                                publication_date=decision_date,
                                decision_number=decision_number,
                                drug_name=drug_name,
                                drug_strength=strength,
                                marketing_authorisation_holder=responsible_entity,
                                batch_number=None,
                                expiry_date=None,
                            )
                            
                            new_records += 1
                            print(f"✅ Created: {drug_name} - {decision_type_str}")
                            
                        except Exception as e:
                            error_msg = f"Error creating record for {drug_name}: {str(e)}"
                            print(f"❌ {error_msg}")
                            results['errors'].append(error_msg)
                            continue
                    
                except Exception as e:
                    error_msg = f"Error processing row: {str(e)}"
                    print(f"❌ {error_msg}")
                    results['errors'].append(error_msg)
                    continue
        
        results['new_records'] = new_records
        results['duplicates_skipped'] = duplicates_skipped
        
        print(f"📊 Scraping completed. New records: {new_records}, Duplicates skipped: {duplicates_skipped}")
        
    except Exception as e:
        error_msg = f"Scraping failed: {str(e)}"
        print(f"❌ {error_msg}")
        results['errors'].append(error_msg)
        raise
    
    return results


def extract_multi_row_data(cell):
    """Extract data from multi-row cells (some drugs have multiple entries)"""
    # Check if cell has multi-row structure
    multi_row_divs = cell.find_all('div', class_='column')
    if multi_row_divs:
        return [div.get_text(strip=True) for div in multi_row_divs]
    else:
        # Single row
        return [cell.get_text(strip=True)]


def clean_html_entities(text):
    """Clean HTML entities from text"""
    if not text:
        return text
    
    # Common HTML entities
    replacements = {
        '&#243;': 'ó',
        '&#211;': 'Ó',
        '&#231;': 'ç',
        '&#246;': 'ö',
        '&#252;': 'ü',
        '&quot;': '"',
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&nbsp;': ' ',
    }
    
    for entity, char in replacements.items():
        text = text.replace(entity, char)
    
    return text


def map_decision_type(decision_type_str):
    """Map RDG decision type to our model event type"""
    if not decision_type_str:
        return DrugEvent.EventType.WITHDRAWAL
        
    decision_type_lower = decision_type_str.lower()
    
    if 'wycofanie' in decision_type_lower:
        return DrugEvent.EventType.WITHDRAWAL
    elif 'wstrzymanie' in decision_type_lower:
        return DrugEvent.EventType.SUSPENSION
    elif 'dopuszczenie' in decision_type_lower:
        return DrugEvent.EventType.REGISTRATION
    elif 'zakaz' in decision_type_lower:
        return DrugEvent.EventType.WITHDRAWAL  # Treat ban as withdrawal
    else:
        return DrugEvent.EventType.WITHDRAWAL  # Default


