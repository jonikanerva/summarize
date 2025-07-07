#!/bin/bash

# upgrade.sh - Updates Node.js to latest LTS, updates packages, and tests build

set -e # Exit on any error

echo "🚀 Starting upgrade process..."

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Store initial versions for comparison
INITIAL_NODE_VERSION=$(node --version)

# Update Node.js to latest LTS using nvm
echo "📦 Installing latest Node.js LTS version..."
nvm install --lts
nvm use --lts

# Get new Node version
NEW_NODE_VERSION=$(node --version)

# Update .nvmrc with the new LTS version
echo "📝 Updating .nvmrc with latest LTS version..."
node --version | sed 's/^v//' >.nvmrc

# Enable corepack for yarn management
echo "🔧 Enabling corepack..."
corepack enable

# Install latest yarn
echo "📦 Installing latest Yarn..."
corepack prepare yarn@stable --activate

# Upgrade all packages using yarn up
echo "⬆️ Upgrading all packages..."
yarn up "*"

# Test that yarn build still works
echo "🔨 Testing build process..."
yarn build

# If we get here, everything worked
echo "✅ Build test passed!"

# Determine what changed
NODE_CHANGED=false
DEPS_CHANGED=false

if ! git diff --quiet .nvmrc 2>/dev/null; then
    NODE_CHANGED=true
fi

if ! git diff --quiet yarn.lock package.json 2>/dev/null; then
    DEPS_CHANGED=true
fi

# Build commit message based on what changed
if [ "$NODE_CHANGED" = true ] && [ "$DEPS_CHANGED" = true ]; then
    COMMIT_MSG="updated node and dependencies"
elif [ "$NODE_CHANGED" = true ]; then
    COMMIT_MSG="updated node"
elif [ "$DEPS_CHANGED" = true ]; then
    COMMIT_MSG="updated dependencies"
else
    echo "ℹ️ No changes detected - Node.js and packages are already up to date"
    exit 0
fi

echo "💾 Committing changes..."

git add .nvmrc yarn.lock package.json
git commit -m "$COMMIT_MSG"

echo "🎉 Upgrade completed and committed!"
