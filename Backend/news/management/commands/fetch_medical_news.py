import requests
from django.core.management.base import BaseCommand
from django.conf import settings
from django.utils import timezone
from openai import OpenAI
from news.models import MedicalNews
from datetime import datetime
import time


class Command(BaseCommand):
    help = 'Pobiera newsy medyczne z PubMed, tłumaczy je na polski przez Scaleway AI i zapisuje w bazie'

    def add_arguments(self, parser):
        parser.add_argument(
            '--limit',
            type=int,
            default=20,
            help='Liczba newsów do pobrania (domyślnie 20)',
        )

    def handle(self, *args, **options):
        limit = options['limit']
        self.stdout.write(self.style.SUCCESS(f'Rozpoczynam pobieranie {limit} newsów medycznych...'))
        
        # Pobieranie newsów z PubMed
        news_data = self.fetch_news_from_apitube(limit)
        
        if not news_data:
            self.stdout.write(self.style.ERROR('Nie udało się pobrać newsów medycznych'))
            return
        
        self.stdout.write(self.style.SUCCESS(f'Pobrano {len(news_data)} newsów'))
        
        # Inicjalizacja klienta Scaleway AI
        scaleway_client = OpenAI(
            base_url="https://9921ae86-3cf5-4e5c-8151-e1d274ceb539.ifr.fr-par.scaleway.com/v1",
            api_key=settings.SCALEWAY_API_KEY
        )
        
        # Przetwarzanie każdego newsa
        created_count = 0
        updated_count = 0
        
        for news_item in news_data:
            try:
                # Sprawdź czy news już istnieje (po URL)
                existing_news = MedicalNews.objects.filter(url=news_item.get('url')).first()
                
                if existing_news and existing_news.is_translated:
                    self.stdout.write(f'News już istnieje i jest przetłumaczony: {news_item.get("title", "")[:50]}...')
                    continue
                
                # Tłumaczenie na polski
                title_pl = self.translate_to_polish(scaleway_client, news_item.get('title', ''))
                description_pl = self.translate_to_polish(scaleway_client, news_item.get('description', ''))
                
                # Parsowanie daty
                published_at = self.parse_date(news_item.get('publishedAt') or news_item.get('published_at'))
                
                if existing_news:
                    # Aktualizuj istniejący news
                    existing_news.title_pl = title_pl
                    existing_news.description_pl = description_pl
                    existing_news.is_translated = True
                    existing_news.save()
                    updated_count += 1
                    self.stdout.write(f'Zaktualizowano: {news_item.get("title", "")[:50]}...')
                else:
                    # Utwórz nowy news
                    MedicalNews.objects.create(
                        title=news_item.get('title', ''),
                        description=news_item.get('description', ''),
                        url=news_item.get('url', ''),
                        source=news_item.get('source', {}).get('name', 'Unknown') if isinstance(news_item.get('source'), dict) else str(news_item.get('source', 'Unknown')),
                        published_at=published_at,
                        image_url=news_item.get('urlToImage') or news_item.get('image_url', ''),
                        title_pl=title_pl,
                        description_pl=description_pl,
                        is_translated=True,
                    )
                    created_count += 1
                    self.stdout.write(f'Utworzono: {news_item.get("title", "")[:50]}...')
                
                # Delay żeby nie przesadzić z API requests
                time.sleep(1)
                
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Błąd podczas przetwarzania newsa: {str(e)}'))
                continue
        
        self.stdout.write(self.style.SUCCESS(
            f'\nZakończono! Utworzono: {created_count}, Zaktualizowano: {updated_count}'
        ))

    def fetch_news_from_apitube(self, limit=20):
        """Pobiera newsy medyczne z PubMed API (NCBI) - całkowicie darmowe!"""
        try:
            import xml.etree.ElementTree as ET
            
            # Step 1: Wyszukaj artykuły w PubMed
            search_url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
            search_params = {
                'db': 'pubmed',
                'term': '(health[Title/Abstract] OR medical[Title/Abstract] OR disease[Title/Abstract]) AND ("last 30 days"[PDat])',
                'retmax': limit,
                'sort': 'pub_date',
                'retmode': 'json',
            }
            
            self.stdout.write(f'Wyszukiwanie artykułów medycznych w PubMed...')
            search_response = requests.get(search_url, params=search_params, timeout=30)
            search_response.raise_for_status()
            search_data = search_response.json()
            
            id_list = search_data.get('esearchresult', {}).get('idlist', [])
            
            if not id_list:
                self.stdout.write(self.style.WARNING('Nie znaleziono artykułów w PubMed'))
                return []
            
            self.stdout.write(f'Znaleziono {len(id_list)} artykułów')
            
            # Step 2: Pobierz szczegóły artykułów
            fetch_url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi"
            fetch_params = {
                'db': 'pubmed',
                'id': ','.join(id_list),
                'retmode': 'xml',
            }
            
            self.stdout.write(f'Pobieranie szczegółów artykułów...')
            fetch_response = requests.get(fetch_url, params=fetch_params, timeout=30)
            fetch_response.raise_for_status()
            
            # Parsowanie XML
            root = ET.fromstring(fetch_response.content)
            
            articles = []
            for article in root.findall('.//PubmedArticle'):
                try:
                    # Tytuł
                    title_elem = article.find('.//ArticleTitle')
                    title = title_elem.text if title_elem is not None and title_elem.text else 'No title'
                    
                    # Abstract
                    abstract_elems = article.findall('.//AbstractText')
                    abstract = ' '.join([elem.text for elem in abstract_elems if elem.text]) if abstract_elems else ''
                    if not abstract:
                        abstract = title  # Fallback do tytułu jeśli brak abstractu
                    
                    # PMID (ID artykułu)
                    pmid_elem = article.find('.//PMID')
                    pmid = pmid_elem.text if pmid_elem is not None else ''
                    
                    # Data publikacji
                    pub_date = article.find('.//PubDate')
                    if pub_date is not None:
                        year = pub_date.find('Year')
                        month = pub_date.find('Month')
                        day = pub_date.find('Day')
                        
                        year_str = year.text if year is not None else '2025'
                        month_str = self.parse_month(month.text if month is not None else '01')
                        day_str = day.text if day is not None else '01'
                        
                        date_str = f"{year_str}-{month_str}-{day_str}T00:00:00Z"
                    else:
                        date_str = timezone.now().isoformat()
                    
                    # Journal/Source
                    journal_elem = article.find('.//Journal/Title')
                    source = journal_elem.text if journal_elem is not None and journal_elem.text else 'PubMed'
                    
                    articles.append({
                        'title': title.strip(),
                        'description': abstract[:1000].strip(),  # Max 1000 chars
                        'url': f'https://pubmed.ncbi.nlm.nih.gov/{pmid}/' if pmid else '',
                        'source': source,
                        'publishedAt': date_str,
                        'urlToImage': '',  # PubMed nie ma obrazków
                    })
                    
                except Exception as e:
                    self.stdout.write(self.style.WARNING(f'Błąd parsowania artykułu: {str(e)}'))
                    continue
            
            self.stdout.write(f'Sparsowano {len(articles)} artykułów z PubMed')
            return articles
            
        except requests.exceptions.RequestException as e:
            self.stdout.write(self.style.ERROR(f'Request Error: {str(e)}'))
            return []
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Błąd: {str(e)}'))
            import traceback
            self.stdout.write(self.style.ERROR(f'Traceback: {traceback.format_exc()}'))
            return []
    
    def parse_month(self, month_str):
        """Konwertuje nazwę miesiąca na numer"""
        months = {
            'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
            'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
            'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12',
            'January': '01', 'February': '02', 'March': '03', 'April': '04',
            'May': '05', 'June': '06', 'July': '07', 'August': '08',
            'September': '09', 'October': '10', 'November': '11', 'December': '12'
        }
        if month_str in months:
            return months[month_str]
        if month_str.isdigit():
            return month_str.zfill(2)
        return '01'

    def translate_to_polish(self, client, text):
        """Tłumaczy tekst na polski używając Scaleway AI"""
        if not text or len(text.strip()) == 0:
            return ""
        
        try:
            response = client.chat.completions.create(
                model="qwen/qwen3-235b-a22b-instruct-2507:awq",
                messages=[
                    {
                        "role": "system",
                        "content": "You are a professional translator. Translate the given text to Polish. Return ONLY the translation, nothing else."
                    },
                    {
                        "role": "user",
                        "content": f"Translate this to Polish: {text}"
                    },
                ],
                max_tokens=512,
                temperature=0.3,
                top_p=0.8,
                stream=False
            )
            
            translated_text = response.choices[0].message.content.strip()
            return translated_text
            
        except Exception as e:
            self.stdout.write(self.style.WARNING(f'Błąd tłumaczenia: {str(e)}. Używam oryginalnego tekstu.'))
            return text

    def parse_date(self, date_string):
        """Parsuje datę z różnych formatów"""
        if not date_string:
            return timezone.now()
        
        try:
            # Próbuj różne formaty
            if isinstance(date_string, str):
                # Format ISO 8601
                return datetime.fromisoformat(date_string.replace('Z', '+00:00'))
            return timezone.now()
        except Exception:
            return timezone.now()

