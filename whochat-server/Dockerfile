FROM php:8.2-cli

# Install system dependencies and PHP extensions
RUN apt-get update && apt-get install -y \
    unzip zip curl git libzip-dev libonig-dev postgresql-client libpq-dev \
    && docker-php-ext-install zip pdo pdo_mysql pdo_pgsql mbstring

# Install Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Set working directory
WORKDIR /var/www

# Copy everything into the container
COPY . .

# Ensure SQLite database directory and file exist
RUN mkdir -p /var/www/database && touch /var/www/database/database.sqlite

# Install dependencies
RUN composer install --no-dev --optimize-autoloader

# Run migrations to create the necessary tables
RUN php artisan migrate --force

# Generate Laravel app key (optional)
RUN php artisan key:generate

EXPOSE 8080

CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8080"]
