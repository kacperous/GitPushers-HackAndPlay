"""
AI Generator for Legal Regulations
Generates title and description using Scaleway AI
"""
import os
import logging
from openai import OpenAI

logger = logging.getLogger(__name__)


def generate_regulation_title_and_description(
    nr_w_wykazie,
    podstawa_wydania,
    tytul_rozporzadzenia,
    istota_rozwiazan,
    przyczyna_potrzeba,
    przyczyny_rezygnacji
):
    """
    Generate AI title and description for a legal regulation
    
    Args:
        nr_w_wykazie: Regulation number
        podstawa_wydania: Legal basis
        tytul_rozporzadzenia: Original title
        istota_rozwiazan: Essence of solutions
        przyczyna_potrzeba: Reason and need
        przyczyny_rezygnacji: Reasons for resignation
    
    Returns:
        tuple: (ai_title, ai_description) or (None, None) on error
    """
    try:
        from django.conf import settings
        
        api_key = settings.SCALEWAY_API_KEY
        base_url = "https://9921ae86-3cf5-4e5c-8151-e1d274ceb539.ifr.fr-par.scaleway.com/v1"
        
        if not api_key:
            logger.warning("SCALEWAY_API_KEY not found in settings")
            return None, None
        
        # Scaleway AI API setup
        client = OpenAI(
            base_url=base_url,
            api_key=api_key
        )
        
        # Determine if regulation is active or resigned
        is_resigned = bool(przyczyny_rezygnacji and przyczyny_rezygnacji.strip())
        status = "WYCOFANY" if is_resigned else "AKTYWNY"
        
        # Prepare prompt
        prompt = f"""Jesteś ekspertem prawnym. Przeanalizuj poniższą regulację prawną i wygeneruj:
1. Krótki, trafny TYTUŁ (max 100 znaków)
2. Zwięzłe PODSUMOWANIE (2-3 zdania)

DANE REGULACJI:
Numer: {nr_w_wykazie}
Status: {status}
Podstawa prawna: {podstawa_wydania[:200] if podstawa_wydania else 'brak'}
Tytuł oryginalny: {tytul_rozporzadzenia[:200] if tytul_rozporzadzenia else 'brak'}
Istota rozwiązań: {istota_rozwiazan[:300] if istota_rozwiazan else 'brak'}
Przyczyna i potrzeba: {przyczyna_potrzeba[:300] if przyczyna_potrzeba else 'brak'}
{"Przyczyny rezygnacji: " + przyczyny_rezygnacji[:200] if is_resigned else ""}

WYMAGANIA:
- TYTUŁ: Krótki, konkretny, opisujący istotę regulacji. Bez słów "Rozporządzenie" na początku.
- PODSUMOWANIE: Profesjonalny język prawniczy, zwięzłe wyjaśnienie celu i zakresu regulacji.
{"- Wspomnij że projekt został WYCOFANY/ZAWIESZONY jeśli tak jest." if is_resigned else ""}

FORMAT ODPOWIEDZI (DOKŁADNIE TAK):
TYTUŁ: [twój tytuł]
PODSUMOWANIE: [twoje podsumowanie]"""

        # Call Scaleway Qwen model
        response = client.chat.completions.create(
            model="qwen/qwen3-235b-a22b-instruct-2507:awq",
            messages=[
                {"role": "system", "content": "Jesteś ekspertem prawnym specjalizującym się w regulacjach Ministerstwa Zdrowia."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=400,
            temperature=0.7,
            top_p=0.8,
            presence_penalty=0,
            stream=False
        )
        
        response_text = response.choices[0].message.content.strip()
        logger.info(f"AI response for regulation {nr_w_wykazie}: {response_text[:100]}...")
        
        # Parse response
        title = None
        description = None
        
        lines = response_text.split('\n')
        for i, line in enumerate(lines):
            if line.startswith('TYTUŁ:'):
                title = line.replace('TYTUŁ:', '').strip()
            elif line.startswith('PODSUMOWANIE:'):
                # Get all remaining lines as description
                description = '\n'.join(lines[i:]).replace('PODSUMOWANIE:', '').strip()
                break
        
        # Fallback parsing if format is not followed
        if not title or not description:
            parts = response_text.split('PODSUMOWANIE:', 1)
            if len(parts) == 2:
                title_part = parts[0].replace('TYTUŁ:', '').strip()
                title = title_part.split('\n')[0].strip()
                description = parts[1].strip()
            else:
                # Use first line as title, rest as description
                lines = response_text.split('\n', 1)
                title = lines[0].replace('TYTUŁ:', '').strip()
                description = lines[1].strip() if len(lines) > 1 else response_text
        
        # Clean up
        title = title[:500] if title else "Brak tytułu"
        description = description if description else "Brak opisu"
        
        logger.info(f"Successfully generated title and description for regulation: {nr_w_wykazie}")
        return title, description
        
    except Exception as e:
        logger.error(f"Error generating AI content for regulation {nr_w_wykazie}: {str(e)}")
        return None, None

