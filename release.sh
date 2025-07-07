#!/bin/bash

set -e

echo "🚀 Starting release process..."

# Get current version from package.json
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo "Current version: $CURRENT_VERSION"

# Extract version parts
IFS='.' read -ra VERSION_PARTS <<< "$CURRENT_VERSION"
MAJOR=${VERSION_PARTS[0]}
MINOR=${VERSION_PARTS[1]}
PATCH=${VERSION_PARTS[2]}

# Increment patch version
NEW_PATCH=$((PATCH + 1))
NEW_VERSION="$MAJOR.$MINOR.$NEW_PATCH"

echo "New version: $NEW_VERSION"

# Update package.json
echo "📝 Updating package.json..."
sed -i '' "s/\"version\": \"$CURRENT_VERSION\"/\"version\": \"$NEW_VERSION\"/" package.json

# Update manifest.json
echo "📝 Updating manifest.json..."
sed -i '' "s/\"version\": \"$CURRENT_VERSION\"/\"version\": \"$NEW_VERSION\"/" manifest.json

# Build the project
echo "🔨 Building project..."
yarn build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Create git tag
    echo "🏷️  Creating git tag v$NEW_VERSION..."
    git add package.json manifest.json
    git commit -m "Release v$NEW_VERSION"
    git tag "v$NEW_VERSION"
    
    echo "🎉 Release v$NEW_VERSION completed successfully!"
    echo "📦 Built extension is in the release/ directory"
    echo "🔗 Don't forget to push the tag: git push origin v$NEW_VERSION"
else
    echo "❌ Build failed! Rolling back version changes..."
    git checkout -- package.json manifest.json
    exit 1
fi