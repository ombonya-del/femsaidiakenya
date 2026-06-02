#!/bin/bash
# FemSaidia Kenya — Intel Brief publish pipeline
# Runs Edge Function → PDF generator → uploads both PDF + viewer to Supabase Storage

SUPABASE_URL="https://uuluuhltphgwfblcghlp.supabase.co"
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1bHV1aGx0cGhnd2ZibGNnaGxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5MjI2NDAsImV4cCI6MjA5MzQ5ODY0MH0.KU_wtm0NVUz8vrMqgozPvTlmiCIf_yXP8Z3Gpmh599E"
PDF_PATH="$HOME/femsaidiakenya/public/intel-brief-latest.pdf"
VIEWER_PATH="$HOME/femsaidiakenya/public/intel-brief-latest-viewer.html"
VIEWER_TMP="$HOME/femsaidiakenya/public/intel-brief-latest-viewer-upload.html"

PDF_STORAGE_URL="${SUPABASE_URL}/storage/v1/object/public/public-assets/intel-brief-latest.pdf"
VIEWER_STORAGE_URL="${SUPABASE_URL}/storage/v1/object/public/public-assets/intel-brief-latest-viewer.html"

echo "🔄  Triggering Intel Brief generation..."
curl -s -X POST "${SUPABASE_URL}/functions/v1/intel-brief" \
  -H "Content-Type: application/json" \
  -d "{}" --http1.1

echo ""
echo "⏳  Waiting for Claude to generate brief..."
sleep 15

echo "📄  Generating PDF + viewer..."
python3 ~/femsaidiakenya/scripts/generate_brief.py

echo "🔧  Patching viewer HTML with Supabase Storage URL..."
# Replace relative pdf reference with absolute storage URL so viewer works from storage
sed "s|intel-brief-latest\.pdf|${PDF_STORAGE_URL}|g" "${VIEWER_PATH}" > "${VIEWER_TMP}"

echo "☁️   Uploading PDF..."
curl -s -X POST "${SUPABASE_URL}/storage/v1/object/public-assets/intel-brief-latest.pdf" \
  -H "Authorization: Bearer ${ANON_KEY}" \
  -H "Content-Type: application/pdf" \
  -H "x-upsert: true" \
  --data-binary @"${PDF_PATH}"
echo ""

echo "☁️   Uploading viewer HTML (inline)..."
curl -s -X POST "${SUPABASE_URL}/storage/v1/object/public-assets/intel-brief-latest-viewer.html" \
  -H "Authorization: Bearer ${ANON_KEY}" \
  -H "Content-Type: text/html; charset=utf-8" \
  -H "x-upsert: true" \
  --data-binary @"${VIEWER_TMP}"
echo ""

# Clean up temp file
rm -f "${VIEWER_TMP}"

echo ""
echo "✅  Intel Brief published!"
echo "📄  PDF:    ${PDF_STORAGE_URL}"
echo "🌐  Viewer: ${VIEWER_STORAGE_URL}"
echo ""
echo "👉  Link your site to the VIEWER URL (not the PDF) for inline display."
