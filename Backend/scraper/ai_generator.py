"""
AI Description Generator for Drug Events
Uses Scaleway AI with Qwen model to generate professional descriptions
"""
import os
import logging
from openai import OpenAI

logger = logging.getLogger(__name__)


def generate_drug_description(event_type, drug_name, drug_strength=None, drug_form=None, 
                              marketing_holder=None, publication_date=None, decision_number=None):
    """
    Generate AI description for a drug event
    
    Args:
        event_type: 'WITHDRAWAL', 'SUSPENSION', or 'REGISTRATION'
        drug_name: Name of the drug
        drug_strength: Drug strength (optional)
        drug_form: Pharmaceutical form (optional)
        marketing_holder: Company name (optional)
        publication_date: Date of decision (optional)
        decision_number: Decision number (optional)
    
    Returns:
        str: Generated description or error message
    """
    try:
        from django.conf import settings
        
        api_key = settings.SCALEWAY_API_KEY
        base_url = "https://9921ae86-3cf5-4e5c-8151-e1d274ceb539.ifr.fr-par.scaleway.com/v1"
        
        if not api_key:
            logger.warning("SCALEWAY_API_KEY not found in settings")
            return None
        
        # Scaleway AI API setup
        client = OpenAI(
            base_url=base_url,
            api_key=api_key
        )
        
        # Prepare prompt based on event type
        if event_type == 'WITHDRAWAL':
            event_desc = "wycofany z obrotu"
            action = "wycofania"
        elif event_type == 'SUSPENSION':
            event_desc = "zawieszony w obrocie"
            action = "zawieszenia"
        else:  # REGISTRATION
            event_desc = "zarejestrowany"
            action = "rejestracji"
        
        prompt_message = os.getenv('PROMPT_MESSAGE')
        prompt = f"""{prompt_message} {event_desc}

Lek: {drug_name}
Moc: {drug_strength or 'nie podano'}
Forma: {drug_form or 'nie podano'}
Producent: {marketing_holder or 'nie podano'}
Data decyzji: {publication_date or 'nie podano'}
Numer decyzji: {decision_number or 'nie podano'}

Wygeneruj krótki (2-3 zdania), profesjonalny opis przyczyny {action}. Opis ma być wiarygodny, profesjonalny, ale całkowicie FIKCYJNY. 
Użyj profesjonalnego języka farmaceutycznego. Nie używaj fraz typu "zmyślony" lub "fikcyjny" w odpowiedzi.
Możesz wymyślić przyczyny takie jak: problemy z jakością, niezgodności w dokumentacji, wykrycie zanieczyszczeń, niespełnienie standardów GMP, problemy z bezpieczeństwem, itp."""

        # Call Scaleway Qwen model
        response = client.chat.completions.create(
            model="qwen/qwen3-235b-a22b-instruct-2507:awq",
            messages=[
                {"role": "system", "content": "Jesteś ekspertem farmaceutycznym generującym profesjonalne opisy decyzji regulacyjnych."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=512,
            temperature=0.7,
            top_p=0.8,
            presence_penalty=0,
            stream=False
        )
        
        description = response.choices[0].message.content.strip()
        logger.info(f"Successfully generated AI description for drug: {drug_name}")
        return description
        
    except Exception as e:
        logger.error(f"Error generating AI description for {drug_name}: {str(e)}")
        # Return None so scraper can continue without AI description
        return None

