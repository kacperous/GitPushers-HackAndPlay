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
    python manage.py createsuperuser \
        --email $DJANGO_SUPERUSER_EMAIL \
        --username $DJANGO_SUPERUSER_USERNAME \
        --noinput
    echo "Superuser created successfully!"

# Start server
echo "Starting server..."
python manage.py runserver 0.0.0.0:6543 