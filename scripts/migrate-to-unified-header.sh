#!/bin/bash

# Script to migrate from AppHeader to UnifiedHeader

echo "🔄 Starting migration from AppHeader to UnifiedHeader..."

# List of files to update
files=(
  "src/components/farm/CropManagement.tsx"
  "src/components/farm/AgriChat.tsx"
  "src/components/farm/KnowledgeBase.tsx"
  "src/components/farm/KnowledgeEntry.tsx"
  "src/components/farm/NewKnowledgeEntry.tsx"
  "src/components/farm/FarmDashboard.tsx"
  "src/features/weather/components/WeatherCenter.tsx"
  "src/features/crops/components/CropManagement.tsx"
  "src/features/chat/components/AgriChat.tsx"
  "src/features/knowledge/components/KnowledgeBase.tsx"
  "src/features/knowledge/components/KnowledgeEntry.tsx"
  "src/features/knowledge/components/NewKnowledgeEntry.tsx"
  "src/features/dashboard/components/FarmDashboard.tsx"
)

# Counter for tracking changes
count=0

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "📝 Processing: $file"
    
    # Replace import statement
    sed -i '' 's/import AppHeader from.*$/import UnifiedHeader from '\''@\/components\/layout\/UnifiedHeader'\'';/g' "$file"
    
    # Replace component usage
    sed -i '' 's/<AppHeader[^>]*\/>/<UnifiedHeader variant="full" \/>/g' "$file"
    sed -i '' 's/<AppHeader[^>]*>/<UnifiedHeader variant="full">/g' "$file"
    sed -i '' 's/<\/AppHeader>/<\/UnifiedHeader>/g' "$file"
    
    ((count++))
  else
    echo "⚠️  File not found: $file"
  fi
done

echo "✅ Migration complete! Updated $count files."
echo ""
echo "📌 Next steps:"
echo "1. Update Dashboard.tsx to use UnifiedHeader with variant='minimal'"
echo "2. Test all pages to ensure proper rendering"
echo "3. Remove old AppHeader and DashboardHeader components"