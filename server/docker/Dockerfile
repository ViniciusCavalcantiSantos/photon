FROM php:8.2-fpm-alpine3.19

WORKDIR /var/www

# Instala extensões PHP e dependências do sistema
RUN apk add --no-cache --virtual .build-deps \
        $PHPIZE_DEPS \
        linux-headers \
        icu-dev \
        libzip-dev \
        zlib-dev \
        libpng-dev \
        libjpeg-turbo-dev \
        freetype-dev \
        imagemagick-dev \
    && apk add --no-cache \
        icu-libs \
        libzip \
        libpng \
        libjpeg-turbo \
        freetype \
        imagemagick \
        libgomp \
    && pecl install redis imagick \
    && docker-php-ext-enable redis imagick \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j"$(nproc)" intl zip pdo_mysql exif gd pcntl opcache \
    # Configuração do Opcache (Hardcoded para segurança) \
    && { \
        echo "opcache.memory_consumption=256"; \
        echo "opcache.interned_strings_buffer=16"; \
        echo "opcache.max_accelerated_files=20000"; \
        echo "opcache.revalidate_freq=0"; \
        echo "opcache.validate_timestamps=0"; \
        echo "opcache.fast_shutdown=1"; \
        echo "opcache.enable_cli=1"; \
    } > /usr/local/etc/php/conf.d/opcache-recommended.ini \
    # Configuração de Limites da Aplicação \
    && { \
        echo "upload_max_filesize=30M"; \
        echo "post_max_size=35M"; \
        echo "memory_limit=512M"; \
        echo "expose_php=off"; \
    } > /usr/local/etc/php/conf.d/app-custom.ini \
    # Limpeza final para reduzir tamanho \
    && apk del .build-deps

COPY --from=composer:2.7 /usr/bin/composer /usr/bin/composer

# Cache de dependências
COPY composer.json composer.lock ./

RUN composer install --no-dev --no-interaction --no-progress --optimize-autoloader --no-scripts

COPY . .

# Setup final de permissões e scripts
RUN php artisan package:discover --ansi \
    && mkdir -p storage/framework/{sessions,views,cache} bootstrap/cache \
    && chown -R www-data:www-data /var/www \
    && chmod -R 775 storage bootstrap/cache

COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

USER www-data

EXPOSE 9000
CMD ["php-fpm"]
