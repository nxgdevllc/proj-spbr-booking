#!/bin/bash

echo "📤 Pushing to GitHub..."
echo "======================="
echo ""

# Check if we can connect to the repository
echo "🔍 Testing repository access..."
if git ls-remote git@github.com:lauxdcom/spbr-booking.git > /dev/null 2>&1; then
    echo "✅ Repository exists and accessible!"
else
    echo "❌ Repository not found or not accessible"
    echo ""
    echo "Please make sure:"
    echo "1. You've created the repository at https://github.com/lauxdcom/spbr-booking"
    echo "2. The repository name is exactly 'spbr-booking'"
    echo "3. You have write access to the repository"
    echo ""
    echo "🔗 Create repository at: https://github.com/new"
    exit 1
fi

echo ""
echo "📦 Adding all files to git..."
git add .

echo "💾 Committing changes..."
git commit -m "Initial commit: San Pedro Beach Resort Management System"

echo "📤 Pushing to GitHub..."
git branch -M main
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Success! Your repository is now on GitHub:"
    echo "🌐 https://github.com/lauxdcom/spbr-booking"
    echo ""
    echo "🚀 Next steps:"
    echo "1. Go to https://vercel.com/new"
    echo "2. Import your GitHub repository"
    echo "3. Deploy to Vercel"
    echo ""
    echo "🎉 Your project will be live at: https://spbr-booking.vercel.app"
else
    echo ""
    echo "❌ Failed to push to GitHub"
    echo "Please check your repository settings and try again"
fi 