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

# Create SQLite directory and file 
RUN mkdir -p /var/www/database && touch /var/www/database/database.sqlite

# Install PHP dependencies without dev packages
RUN composer install --no-dev --optimize-autoloader --no-scripts


# Expose Laravel development server port
EXPOSE 8080

# Copy entrypoint script
COPY start.sh /start.sh
RUN chmod +x /start.sh

CMD ["/start.sh"]
