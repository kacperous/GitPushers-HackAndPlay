import requests
import json
from datetime import datetime, timedelta
from django.utils import timezone
from django.db import transaction
import random
import logging

from .models import DrugEvent
from .ai_generator import generate_drug_description

logger = logging.getLogger(__name__)


def scrape_medicinal_products():
    """
    Scrapes data from medicinal products API and saves to database
    Returns dict with scraping results
    """
    base_url = "https://rejestry.ezdrowie.gov.pl/api/rpl/medicinal-products/search/public"
    results = {
        'new_records': 0,
        'duplicates_skipped': 0,
        'errors': []
    }
    
    try:
        print("🔍 Scraping data from medicinal products API...")
        
        # Parameters for API request
        params = {
            'subjectRolesIds': 1,
            'isAdvancedSearch': 'false',
            'size': 25,
            'page': 0,
            'sort': 'name,ASC'
        }
        
        # Get data from API
        response = requests.get(base_url, params=params, timeout=30)
        response.raise_for_status()
        
        data = response.json()
        products = data.get('content', [])
        
        print(f"📊 Found {len(products)} medicinal products")
        
        # Prepare for random dates from last 10 days
        end_date = timezone.now().date()
        
        new_records = 0
        duplicates_skipped = 0
        
        with transaction.atomic():
            for product in products:
                try:
                    # Generate random date from last 10 days for each record
                    random_days = random.randint(0, 9)  # 0-9 days ago (last 10 days)
                    random_date = end_date - timedelta(days=random_days)
                    
                    # Extract data from product
                    drug_name = product.get('medicinalProductName', '')
                    common_name = product.get('commonName', '')
                    pharmaceutical_form = product.get('pharmaceuticalFormName', '')
                    power = product.get('medicinalProductPower', '')
                    active_substance = product.get('activeSubstanceName', '')
                    subject_name = product.get('subjectMedicinalProductName', '')
                    registry_number = product.get('registryNumber', '')
                    procedure_type = product.get('procedureTypeName', '')
                    expiration_date = product.get('expirationDateString', '')
                    atc_code = product.get('atcCode', '')
                    
                    # Use common_name as drug_name, fallback to medicinalProductName if common_name is empty
                    final_drug_name = common_name if common_name else drug_name
                    
                    if not final_drug_name:
                        continue
                    
                    # Create decision number from registry number
                    decision_number = f"REG/{registry_number}" if registry_number else f"REG/{random.randint(10000, 99999)}"
                    
                    # Map procedure type to event type
                    event_type = map_procedure_type_to_event_type(procedure_type)
                    
                    # Check for duplicates (based on event_type, drug_name, and source)
                    if DrugEvent.objects.filter(
                        event_type=event_type,
                        drug_name=final_drug_name,
                        source=DrugEvent.DataSource.URPL
                    ).exists():
                        print(f"⏭️  Skipping duplicate: {final_drug_name}")
                        duplicates_skipped += 1
                        continue
                    
                    # Create new DrugEvent
                    try:
                        # Generate AI description
                        ai_description = generate_drug_description(
                            event_type=event_type,
                            drug_name=final_drug_name,
                            drug_strength=power,
                            drug_form=pharmaceutical_form,
                            marketing_holder=subject_name,
                            publication_date=random_date,
                            decision_number=decision_number
                        )
                        
                        drug_event = DrugEvent.objects.create(
                            event_type=event_type,
                            source=DrugEvent.DataSource.URPL,  # URPL for medicinal products
                            publication_date=random_date,
                            decision_number=decision_number,
                            drug_name=final_drug_name,
                            drug_strength=power,
                            drug_form=pharmaceutical_form,
                            marketing_authorisation_holder=subject_name,
                            batch_number=None,  # Not available in this data
                            expiry_date=parse_expiration_date(expiration_date),
                            description=ai_description,
                        )
                        
                        new_records += 1
                        desc_status = "✨ with AI" if ai_description else "📝 no AI"
                        print(f"✅ Created: {final_drug_name} - {event_type} - {random_date} {desc_status}")
                        
                    except Exception as e:
                        error_msg = f"Error creating record for {final_drug_name}: {str(e)}"
                        print(f"❌ {error_msg}")
                        results['errors'].append(error_msg)
                        continue
                
                except Exception as e:
                    error_msg = f"Error processing product: {str(e)}"
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


def map_procedure_type_to_event_type(procedure_type):
    """Map procedure type to event type"""
    if not procedure_type:
        return DrugEvent.EventType.REGISTRATION
    
    procedure_type_lower = procedure_type.lower()
    
    if 'nar' in procedure_type_lower:
        return DrugEvent.EventType.REGISTRATION
    elif 'dcp' in procedure_type_lower:
        return DrugEvent.EventType.REGISTRATION
    elif 'cen' in procedure_type_lower:
        return DrugEvent.EventType.REGISTRATION
    else:
        return DrugEvent.EventType.REGISTRATION  # Default to registration


def parse_expiration_date(expiration_date_str):
    """Parse expiration date string to date object"""
    if not expiration_date_str or expiration_date_str == 'Bezterminowe':
        return None
    
    try:
        # Try to parse date in format YYYY-MM-DD
        return datetime.strptime(expiration_date_str, '%Y-%m-%d').date()
    except ValueError:
        try:
            # Try to parse date in format DD-MM-YYYY
            return datetime.strptime(expiration_date_str, '%d-%m-%Y').date()
        except ValueError:
            return None
