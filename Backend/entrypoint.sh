#!/bin/bash
set -e

# Wait for database to be ready
echo "Waiting for PostgreSQL..."
while ! pg_isready -h db_hackathon -p 5432 -U $POSTGRES_USER -d $POSTGRES_DB; do
    sleep 1
done
echo "PostgreSQL started"

# Run migrations
echo "Running migrations..."
python manage.py makemigrations --noinput

# Try to run migrations, use fake-initial if they fail
echo "Attempting to run migrations..."
python manage.py migrate --noinput || {
    echo "Regular migrations failed, trying with fake-initial..."
    python manage.py migrate --fake-initial --noinput || {
        echo "Fake-initial also failed, trying to fake specific apps..."
        # Fake the problematic migrations
        python manage.py migrate auth --fake-initial
        python manage.py migrate contenttypes --fake-initial
        python manage.py migrate sessions --fake-initial
        python manage.py migrate admin --fake-initial
        python manage.py migrate security --fake-initial
        python manage.py migrate scraper --fake-initial
        python manage.py migrate pharmac --fake-initial
        python manage.py migrate regulations --fake-initial
        python manage.py migrate news --fake-initial
        python manage.py migrate token_blacklist --fake-initial
        echo "Migration faking completed."
    }
}

# Wait a moment for database to settle
echo "Waiting for database to settle..."
sleep 2

# Create superuser if it doesn't exist (after migrations are complete)
echo "Creating superuser..."

# Use Django's built-in createsuperuser command with environment variables
# Set environment variables for the management command
export DJANGO_SUPERUSER_EMAIL="${DJANGO_SUPERUSER_EMAIL}"
export DJANGO_SUPERUSER_PASSWORD="${DJANGO_SUPERUSER_PASSWORD}"

python manage.py shell -c "
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'api.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.core.management import execute_from_command_line
from django.db import connection

# Ensure database is ready
try:
    connection.ensure_connection()
    User = get_user_model()

    # Check if superuser already exists
    superuser_email = os.environ.get('DJANGO_SUPERUSER_EMAIL', 'admin@example.com')
    try:
        if not User.objects.filter(email=superuser_email).exists():
            print(f'Creating superuser: {superuser_email}')
            # Create superuser with all required fields
            User.objects.create_superuser(
                email=superuser_email,
                first_name='Admin',
                last_name='User',
                password=os.environ.get('DJANGO_SUPERUSER_PASSWORD', 'admin123'),
                account_type='doctor',
                is_staff=True,
                is_superuser=True,
                is_active=True
            )
            print('✅ Superuser created successfully!')
        else:
            print('✅ Superuser already exists')
    except Exception as e:
        print(f'⚠️  Warning: Could not create superuser: {e}')
        print('Continuing without superuser creation...')
except Exception as e:
    print(f'⚠️  Warning: Could not connect to database: {e}')
    print('Continuing without superuser creation...')
"

# Execute the passed command or default
exec "$@" 