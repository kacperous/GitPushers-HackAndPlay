#!/bin/bash

# Wait for database to be ready
echo "Waiting for PostgreSQL..."
while ! pg_isready -h db_hackathon -p 5432 -U $POSTGRES_USER -d $POSTGRES_DB; do
    sleep 1
done
echo "PostgreSQL started"

# Run migrations
echo "Running migrations..."
python manage.py makemigrations
python manage.py migrate

# Create superuser if it doesn't exist
echo "Creating superuser..."
python manage.py shell -c "
from django.contrib.auth import get_user_model;
User = get_user_model();
if not User.objects.filter(email='${DJANGO_SUPERUSER_EMAIL}').exists():
    User.objects.create_superuser(email='${DJANGO_SUPERUSER_EMAIL}', first_name='Admin', last_name='User', password='${DJANGO_SUPERUSER_PASSWORD}');
    print('✅ Superuser created successfully!');
else:
    print('✅ Superuser already exists');
"

# Execute the passed command or default
exec "$@" 