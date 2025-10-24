# Automatyzacja Scraperów - Dokumentacja

## Przegląd

System automatycznego scrapingu danych o lekach z dwóch źródeł:
- **GIF** (Główny Inspektorat Farmaceutyczny) - wycofania i zawieszenia
- **URPL** (Urząd Rejestracji Produktów Leczniczych) - nowe rejestracje

## Harmonogram

### Automatyczne uruchomienie
- **Godzina**: Codziennie o **6:00 rano** (strefa czasowa: Europe/Warsaw)
- **Sprawdzanie**: Jeśli scraping został już dzisiaj wykonany - pomija
- **Źródła danych**: Oba scrapery (GIF + URPL) uruchamiane równocześnie

### Uruchomienie przy starcie
- **Start aplikacji**: System automatycznie sprawdza czy scraping został wykonany dzisiaj
- **Jeśli nie**: Uruchamia oba scrapery
- **Jeśli tak**: Pomija i czeka na następny zaplanowany czas

## Architektura

### Komponenty

1. **Celery Worker** - wykonuje zadania scrapingu w tle
2. **Celery Beat** - scheduler (harmonogram) uruchamiający zadania o 6:00
3. **Redis** - broker kolejek zadań
4. **PostgreSQL** - przechowuje dane i historię zadań

### Kontenery Docker

```yaml
- api_hackathon      # Django API
- celery_worker      # Wykonawca zadań
- celery_beat        # Harmonogram
- redis              # Broker
- db_hackathon       # Baza danych
```

## Zadania Celery

### 1. `run_daily_scraping`
Główne zadanie uruchamiane codziennie o 6:00.

**Funkcjonalność:**
- Sprawdza czy scraping został już wykonany dzisiaj
- Uruchamia oba scrapery (GIF + URPL)
- Loguje wyniki
- Zwraca statystyki

**Harmonogram:**
```python
'scrape-daily-at-6am': {
    'task': 'scraper.tasks.run_daily_scraping',
    'schedule': crontab(hour=6, minute=0),
}
```

### 2. `check_and_run_scraping`
Sprawdza czy scraping jest potrzebny i uruchamia jeśli tak.

**Użycie:**
- Wywoływane przy starcie aplikacji
- Można wywołać ręcznie w dowolnym momencie

### 3. `run_gif_scraper`
Uruchamia tylko scraper GIF (wycofania/zawieszenia).

### 4. `run_urpl_scraper`
Uruchamia tylko scraper URPL (rejestracje).

## Ręczne uruchamianie

### Uruchomienie wszystkich scraperów
```bash
# W kontenerze Docker
docker-compose exec api_hackathon python manage.py do_scrape --show-details

# Przez Celery (asynchronicznie)
docker-compose exec api_hackathon python manage.py shell -c \
  "from scraper.tasks import check_and_run_scraping; check_and_run_scraping.delay()"
```

### Uruchomienie pojedynczego scrapera
```bash
# GIF scraper
docker-compose exec api_hackathon python manage.py scrape_gif

# URPL scraper
docker-compose exec api_hackathon python manage.py scrape_urpl
```

### Sprawdzenie czy scraping jest potrzebny
```bash
docker-compose exec api_hackathon python manage.py check_scraping
```

## Monitorowanie

### Logi Celery Worker
```bash
docker-compose logs celery_worker -f
```

### Logi Celery Beat (harmonogram)
```bash
docker-compose logs celery_beat -f
```

### Status wszystkich kontenerów
```bash
docker-compose ps
```

### Sprawdzenie wykonanych zadań
Wejdź do Django Admin → Celery Results → Task Results

## Konfiguracja

### Zmiana godziny uruchomienia

Edytuj `/Backend/api/celery.py`:

```python
app.conf.beat_schedule = {
    'scrape-daily-at-6am': {
        'task': 'scraper.tasks.run_daily_scraping',
        'schedule': crontab(hour=8, minute=30),  # Zmień na 8:30
    },
}
```

Następnie:
```bash
docker-compose restart celery_beat
```

### Zmiana strefy czasowej

Edytuj `/Backend/api/celery.py`:

```python
app.conf.timezone = 'America/New_York'  # Zmień strefę
```

## Bezpieczeństwo duplikatów

System zapobiega duplikatom na 2 poziomach:

### 1. Constraint w bazie danych
```python
models.UniqueConstraint(
    fields=['event_type', 'drug_name', 'source'],
    name='unique_event_drug_source'
)
```

### 2. Sprawdzanie przed dodaniem
Scraper sprawdza czy rekord już istnieje przed próbą dodania.

## Szczegóły techniczne

### Broker: Redis
- **URL**: `redis://redis:6379/0`
- **Port**: 6379
- **Persistencja**: Volume `redis_data`

### Baza danych: PostgreSQL
- **Host**: `db_hackathon`
- **Port**: 5432
- **Persistencja**: Volume `postgres_data`

### Celery Configuration
- **Result Backend**: Django DB
- **Serializer**: JSON
- **Timezone**: Europe/Warsaw
- **Scheduler**: DatabaseScheduler (django-celery-beat)

## Troubleshooting

### Problem: Zadania nie są wykonywane

1. Sprawdź czy Celery Worker działa:
```bash
docker-compose ps | grep celery_worker
```

2. Sprawdź logi workera:
```bash
docker-compose logs celery_worker --tail=50
```

3. Sprawdź połączenie z Redis:
```bash
docker-compose exec redis redis-cli ping
# Powinno zwrócić: PONG
```

### Problem: Harmonogram się nie wykonuje

1. Sprawdź czy Celery Beat działa:
```bash
docker-compose ps | grep celery_beat
```

2. Sprawdź harmonogram w bazie:
```bash
docker-compose exec api_hackathon python manage.py shell -c \
  "from django_celery_beat.models import PeriodicTask; print(PeriodicTask.objects.all())"
```

### Problem: Duplikaty są dodawane

1. Sprawdź constraint w bazie:
```bash
docker-compose exec db_hackathon psql -U HackUser -d HackDB -c \
  "SELECT conname FROM pg_constraint WHERE conname='unique_event_drug_source';"
```

2. Jeśli nie ma - uruchom migracje:
```bash
docker-compose exec api_hackathon python manage.py migrate
```

## Przykładowy output

```
[2025-10-24 14:34:02] 🚀 Starting daily scraping task...
[2025-10-24 14:34:02] 📊 No records found for today (2025-10-24). Starting scrapers...
[2025-10-24 14:34:02] 📋 Running GIF scraper...
[2025-10-24 14:34:02] ✅ Created: Benlek - Wycofanie z obrotu
[2025-10-24 14:34:02] ✅ GIF scraper completed: 3 new records
[2025-10-24 14:34:02] 💊 Running URPL scraper...
[2025-10-24 14:34:02] ✅ Created: Natrii chloridum - REGISTRATION
[2025-10-24 14:34:02] ✅ URPL scraper completed: 18 new records
[2025-10-24 14:34:02] 🎉 Daily scraping completed! Total new records: 21
```

## Referencje

- [Celery Documentation](https://docs.celeryproject.org/)
- [Django Celery Beat](https://django-celery-beat.readthedocs.io/)
- [Redis](https://redis.io/documentation)

