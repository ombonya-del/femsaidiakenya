#!/bin/bash
echo "🔄 Triggering Intel Brief generation..."
curl -s -X POST "https://uuluuhltphgwfblcghlp.supabase.co/functions/v1/intel-brief" \
  -H "Content-Type: application/json" \
  -d "{}" --http1.1

echo ""
echo "⏳ Waiting for Claude to generate brief..."
sleep 15

echo "📄 Generating PDF..."
python3 ~/femsaidiakenya/scripts/generate_brief.py

echo "☁️  Uploading to Supabase..."
curl -s -X POST "https://uuluuhltphgwfblcghlp.supabase.co/storage/v1/object/public-assets/intel-brief-latest.pdf" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1bHV1aGx0cGhnd2ZibGNnaGxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5MjI2NDAsImV4cCI6MjA5MzQ5ODY0MH0.KU_wtm0NVUz8vrMqgozPvTlmiCIf_yXP8Z3Gpmh599E" \
  -H "Content-Type: application/pdf" \
  -H "x-upsert: true" \
  --data-binary @/Users/vo/femsaidiakenya/public/intel-brief-latest.pdf

echo ""
echo "✅ Intel Brief published!"
