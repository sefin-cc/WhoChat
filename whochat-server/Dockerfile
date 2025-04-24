FROM php:8.2-cli

# Install system dependencies and PHP extensions
RUN apt-get update && apt-get install -y \
    unzip zip curl git libzip-dev libonig-dev postgresql-client libpq-dev \
    && docker-php-ext-install zip pdo pdo_mysql pdo_pgsql mbstring

# Install Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Set working directory
WORKDIR /var/www

# Copy application code
COPY . .

# Set dummy env vars to prevent Laravel from crashing during build
ENV BROADCAST_DRIVER=log \
    PUSHER_APP_ID=dummy \
    PUSHER_APP_KEY=dummy \
    PUSHER_APP_SECRET=dummy

# Create SQLite directory and file (optional for local dev)
RUN mkdir -p /var/www/database && touch /var/www/database/database.sqlite

# Install PHP dependencies without dev packages
RUN composer install --no-dev --optimize-autoloader

# Create a minimal .env file directly (no need for .env.example)
RUN echo "APP_NAME=Laravel\nAPP_ENV=local\nAPP_KEY=\nAPP_DEBUG=true\nAPP_URL=http://localhost\nLOG_CHANNEL=stack\nBROADCAST_DRIVER=log\nDB_CONNECTION=sqlite" > .env

# Generate application key
RUN php artisan key:generate

# Run database migrations
RUN php artisan migrate --force

# Expose port for Laravel built-in server
EXPOSE 8080

# Start Laravel development server
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8080"]
