FROM php:8.2-cli

# Install necessary system dependencies
RUN apt-get update && apt-get install -y \
    unzip zip curl git libzip-dev libonig-dev postgresql-client libpq-dev \
    && docker-php-ext-install zip pdo pdo_mysql pdo_pgsql mbstring

# Install Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Set working directory
WORKDIR /var/www

# Copy application files
COPY . .

# Add dummy Pusher environment variables to avoid errors
RUN echo "PUSHER_APP_KEY=dummykey" >> .env \
    && echo "PUSHER_APP_SECRET=dummysecret" >> .env \
    && echo "PUSHER_APP_ID=dummyappid" >> .env \
    && echo "PUSHER_APP_CLUSTER=mt1" >> .env

# Install Composer dependencies after ensuring the .env file exists
RUN composer install --no-dev --optimize-autoloader

# Clear Laravel config cache
RUN php artisan config:clear

# Optionally generate the app key (if you haven't done so yet)
RUN php artisan key:generate

# Expose port 8080
EXPOSE 8080

# Run Laravel server
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8080"]
