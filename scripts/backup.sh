#!/bin/bash
# Backup Script for Sattavillaku DB
# Run daily via Cron: 0 2 * * * (2 AM IST)

set -e

# Load environment variables (ensure .env.local is present in scripts dir or server env)
DB_URL=$SUPABASE_DB_URL
STORAGE_KEY=$SUPABASE_SERVICE_ROLE_KEY
PROJECT_REF=$SUPABASE_PROJECT_ID
RESEND_KEY=$RESEND_API_KEY
EMAIL_TO="sattavilakku@gmail.com"

DATE=$(date +%Y-%m-%d)
FILENAME="backup-${DATE}.sql.gz"

echo "Starting database backup for ${DATE}..."

# 1. Dump database and compress
pg_dump "$DB_URL" | gzip > "$FILENAME"

# 2. Upload to Supabase Storage ('backups' bucket)
curl -X POST "https://${PROJECT_REF}.supabase.co/storage/v1/object/backups/${FILENAME}" \
  -H "Authorization: Bearer ${STORAGE_KEY}" \
  -H "Content-Type: application/gzip" \
  --data-binary "@${FILENAME}"

# 3. Clean up local file
rm "$FILENAME"

# 4. Auto-delete backups older than 30 days via Supabase API (Conceptual - requires scripting to list and delete)
# Note: For production, consider using Supabase Point-in-Time Recovery (PITR) on Pro plan.

# 5. Send confirmation email via Resend
curl -X POST "https://api.resend.com/emails" \
  -H "Authorization: Bearer ${RESEND_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "noreply@sattavilakku.com",
    "to": "'"${EMAIL_TO}"'",
    "subject": "✅ Database Backup Successful - '${DATE}'",
    "html": "<p>சட்டவிளக்கு தரவுத்தள காப்புப்பிரதி (Backup) வெற்றிகரமாக சேமிக்கப்பட்டது.</p><p>நாள்: '${DATE}'</p>"
  }'

echo "Backup complete!"
