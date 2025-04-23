
FROM php:8.3-fpm AS build

WORKDIR /var/www

# Install system dependencies for build
RUN apt-get update && apt-get install -y \
    git \
    curl \
    unzip \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    && docker-php-ext-install pdo mbstring exif pcntl bcmath gd

# Install Composer manually
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Copy app files
COPY . .

# Install PHP dependencies (optimized)
RUN composer install --no-dev --optimize-autoloader


# Production
FROM php:8.3-fpm

WORKDIR /var/www

# Install necessary PHP extensions only (no curl, git, etc.)
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    && docker-php-ext-install pdo mbstring exif pcntl bcmath gd \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy built app from the builder stage
COPY --from=build /var/www /var/www

# Set correct permissions
RUN chown -R www-data:www-data /var/www \
    && chmod -R 755 /var/www

# Expose port 8080 for Laravel server
EXPOSE 8080

# Start Laravel development server
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8080"]
