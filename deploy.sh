#!/bin/bash

# San Pedro Beach Resort - Deployment Script
echo "🚀 Starting deployment process..."

# Check if repository URL is provided
if [ -z "$1" ]; then
    echo "❌ Please provide your GitHub repository URL"
    echo "Usage: ./deploy.sh https://github.com/yourusername/spbr-booking.git"
    exit 1
fi

REPO_URL=$1

echo "📦 Adding files to git..."
git add .

echo "💾 Committing changes..."
git commit -m "Add deployment configuration and Vercel setup"

echo "🔗 Adding remote repository..."
git remote add origin $REPO_URL

echo "📤 Pushing to GitHub..."
git branch -M main
git push -u origin main

echo "✅ GitHub deployment complete!"
echo ""
echo "🌐 Next steps:"
echo "1. Go to https://vercel.com/new"
echo "2. Import your GitHub repository: $REPO_URL"
echo "3. Configure environment variables in Vercel dashboard"
echo "4. Deploy!"
echo ""
echo "🎉 Your project will be live at: https://your-project-name.vercel.app" 