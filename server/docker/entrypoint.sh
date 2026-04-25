#!/bin/sh
set -e

# ──────────────────────────────────────────────
# 1. Auto-bootstrap (dev only)
# ──────────────────────────────────────────────

if [ "$CONTAINER_ROLE" = "app" ] || [ "${AUTO_BOOTSTRAP:-true}" = "true" -a -z "$CONTAINER_ROLE" ]; then
    # We are the main app container. Do the bootstrap.

    # Install composer dependencies if vendor/ is missing
    if [ ! -d "/var/www/vendor" ]; then
        echo "📦 vendor/ not found — running composer install..."
        su-exec www-data composer install --no-interaction --no-progress --optimize-autoloader
    fi

    # Create .env from .env.example if it doesn't exist
    if [ ! -f "/var/www/.env" ]; then
        echo "📄 .env not found — copying from .env.example..."
        su-exec www-data cp /var/www/.env.example /var/www/.env
    fi

    # Generate APP_KEY if empty
    APP_KEY=$(grep -E "^APP_KEY=" /var/www/.env | cut -d '=' -f2-)
    if [ -z "$APP_KEY" ]; then
        echo "🔑 APP_KEY is empty — generating..."
        su-exec www-data php artisan key:generate --ansi --force
    fi

    # ──────────────────────────────────────────────
    # 2. Wait for MySQL and run migrations
    # ──────────────────────────────────────────────

    if [ "${AUTO_MIGRATE:-true}" = "true" ]; then
        echo "⏳ Waiting for database..."
        MAX_RETRIES=30
        RETRIES=0
        until su-exec www-data php artisan db:monitor --databases=mysql > /dev/null 2>&1 || [ $RETRIES -ge $MAX_RETRIES ]; do
            RETRIES=$((RETRIES + 1))
            sleep 2
        done

        if [ $RETRIES -lt $MAX_RETRIES ]; then
            echo "🗃️  Running migrations..."
            su-exec www-data php artisan migrate --seed --force
        else
            echo "⚠️  Database not reachable after ${MAX_RETRIES} attempts, skipping migrations."
        fi
    fi
else
    # We are a worker/queue container
    if [ ! -d "/var/www/vendor" ] || [ ! -f "/var/www/vendor/autoload.php" ]; then
        echo "⏳ Sub-container waiting for vendor/ to be created by main app..."
        while [ ! -f "/var/www/vendor/autoload.php" ]; do
            sleep 2
        done
        echo "✅ vendor/ is ready!"
        # Small delay to give app time to finish DB migrations before we start listening
        sleep 5
    fi
fi

# ──────────────────────────────────────────────
# 3. Ensure writable dirs exist & fix ownership
# ──────────────────────────────────────────────

# Create dirs as www-data (correct UID from build args)
su-exec www-data mkdir -p \
    /var/www/storage/framework/sessions \
    /var/www/storage/framework/views \
    /var/www/storage/framework/cache \
    /var/www/storage/logs \
    /var/www/bootstrap/cache

# Fix ownership of any existing files that may have stale UID
# (e.g. 82 from Alpine's default www-data before usermod).
# After the first run, this is a fast no-op since UIDs already match.
chown -R www-data:www-data \
    /var/www/storage \
    /var/www/bootstrap/cache

# ──────────────────────────────────────────────
# 4. Start — php-fpm needs root, everything else runs as www-data
# ──────────────────────────────────────────────

if [ "$CONTAINER_ROLE" = "app" ] || [ "${AUTO_BOOTSTRAP:-true}" = "true" -a -z "$CONTAINER_ROLE" ]; then
    echo "🧹 Clearing configuration cache..."
    su-exec www-data php artisan config:clear
fi

echo "🚀 Starting application..."

if [ "$1" = "php-fpm" ]; then
    exec "$@"
else
    exec su-exec www-data "$@"
fi
