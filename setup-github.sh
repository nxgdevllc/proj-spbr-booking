#!/bin/bash

# GitHub Setup Script for San Pedro Beach Resort
echo "🚀 Setting up GitHub repository..."

# Check if repository name is provided
if [ -z "$1" ]; then
    echo "❌ Please provide your repository name"
    echo "Usage: ./setup-github.sh spbr-booking"
    echo ""
    echo "📋 Steps to complete:"
    echo "1. Go to https://github.com/new"
    echo "2. Repository name: spbr-booking"
    echo "3. Description: San Pedro Beach Resort Management System"
    echo "4. Make it Public"
    echo "5. DO NOT initialize with README, .gitignore, or license"
    echo "6. Click 'Create repository'"
    echo ""
    echo "Then run: ./setup-github.sh spbr-booking"
    exit 1
fi

REPO_NAME=$1
GITHUB_USER="lauxdcom"

echo "📦 Adding all files to git..."
git add .

echo "💾 Committing changes..."
git commit -m "Initial commit: San Pedro Beach Resort Management System"

echo "🔗 Setting up remote repository..."
git remote set-url origin git@github.com:${GITHUB_USER}/${REPO_NAME}.git

echo "📤 Pushing to GitHub..."
git branch -M main
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Success! Your repository is now on GitHub:"
    echo "🌐 https://github.com/${GITHUB_USER}/${REPO_NAME}"
    echo ""
    echo "🚀 Next steps:"
    echo "1. Go to https://vercel.com/new"
    echo "2. Import your GitHub repository"
    echo "3. Deploy to Vercel"
    echo ""
    echo "🎉 Your project will be live at: https://${REPO_NAME}.vercel.app"
else
    echo ""
    echo "❌ Failed to push to GitHub"
    echo "Please make sure:"
    echo "1. Repository exists at https://github.com/${GITHUB_USER}/${REPO_NAME}"
    echo "2. SSH key is added to GitHub"
    echo "3. You have write access to the repository"
fi 