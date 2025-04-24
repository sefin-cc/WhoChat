#!/bin/sh

echo "Running Laravel setup steps..."

set -e  # Exit immediately if a command exits with a non-zero status

# Create .env if it doesn't exist
if [ ! -f .env ]; then
  echo "Creating default .env from Render env variables..."
  cp .env.example .env
fi

echo "Clearing config..."
php artisan config:clear

echo "Caching config..."
php artisan config:cache

echo " Generating app key..."
php artisan key:generate


echo " Running package discovery..."
php artisan package:discover

echo " Starting Laravel development server..."
php artisan serve --host=0.0.0.0 --port=8080
