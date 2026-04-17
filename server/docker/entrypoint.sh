#!/bin/sh
set -e

# ──────────────────────────────────────────────
# 1. Auto-bootstrap (dev only)
# ──────────────────────────────────────────────

# Install composer dependencies if vendor/ is missing
if [ ! -d "/var/www/vendor" ]; then
    echo "📦 vendor/ not found — running composer install..."
    composer install --no-interaction --no-progress --optimize-autoloader
fi

# Create .env from .env.example if it doesn't exist
if [ ! -f "/var/www/.env" ]; then
    echo "📄 .env not found — copying from .env.example..."
    cp /var/www/.env.example /var/www/.env
fi

# Generate APP_KEY if empty
APP_KEY=$(grep -E "^APP_KEY=" /var/www/.env | cut -d '=' -f2-)
if [ -z "$APP_KEY" ]; then
    echo "🔑 APP_KEY is empty — generating..."
    php artisan key:generate --ansi --force
fi

# ──────────────────────────────────────────────
# 2. Wait for MySQL and run migrations
# ──────────────────────────────────────────────

if [ "${AUTO_MIGRATE:-true}" = "true" ]; then
    echo "⏳ Waiting for database..."
    MAX_RETRIES=30
    RETRIES=0
    until php artisan db:monitor --databases=mysql > /dev/null 2>&1 || [ $RETRIES -ge $MAX_RETRIES ]; do
        RETRIES=$((RETRIES + 1))
        sleep 2
    done

    if [ $RETRIES -lt $MAX_RETRIES ]; then
        echo "🗃️  Running migrations..."
        php artisan migrate --force
    else
        echo "⚠️  Database not reachable after ${MAX_RETRIES} attempts, skipping migrations."
    fi
fi

# ──────────────────────────────────────────────
# 3. Fix permissions (existing logic)
# ──────────────────────────────────────────────

TARGETS="/var/www/storage /var/www/bootstrap/cache"

for d in $TARGETS; do
    if [ -d "$d" ]; then
        owner=$(stat -c '%u:%g' "$d" 2>/dev/null || echo "")
        www_uid=$(id -u www-data)
        www_gid=$(id -g www-data)

        if [ "$owner" != "$www_uid:$www_gid" ]; then
            echo "🔧 Fixing permissions: $d"
            chown -R www-data:www-data "$d" || echo "⚠️  Warning: failed to set owner on $d"
        else
            echo "✅ Permissions OK: $d"
        fi

        find "$d" -type d -exec chmod 775 {} \;
        find "$d" -type f -exec chmod 664 {} \;
    fi
done

echo "🚀 Starting application..."
exec "$@"
