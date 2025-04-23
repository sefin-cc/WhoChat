FROM php:8.2-cli

# Install system dependencies and PHP extensions
RUN apt-get update && apt-get install -y \
    unzip zip curl git libzip-dev libonig-dev postgresql-client libpq-dev \
    && docker-php-ext-install zip pdo pdo_mysql pdo_pgsql mbstring \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Set working directory
WORKDIR /var/www

# Copy application files
COPY . .

# Ensure the SQLite file exists to prevent build failure
RUN mkdir -p database && touch database/database.sqlite

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader

# (Optional) Generate Laravel app key
RUN php artisan key:generate

# Expose the Laravel dev server port
EXPOSE 8080

# Start Laravel dev server
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8080"]
