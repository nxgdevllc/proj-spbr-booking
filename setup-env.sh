#!/bin/bash

echo "🚀 San Pedro Beach Resort - Environment Setup"
echo "=============================================="
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local file..."
    cp .env.example .env.local
fi

echo "📋 Environment Variables Setup"
echo "=============================="
echo ""
echo "You need to manually edit .env.local with your actual values:"
echo ""
echo "1. SUPABASE SETUP:"
echo "   - Go to https://supabase.com"
echo "   - Create a new project (Singapore region)"
echo "   - Go to Settings → API"
echo "   - Copy your Project URL, Anon Key, and Service Role Key"
echo ""
echo "2. UPDATE .env.local:"
echo "   Replace these placeholders in .env.local:"
echo ""
echo "   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co"
echo "   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here"
echo "   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here"
echo ""
echo "3. LOCAL DEVELOPMENT:"
echo "   For local testing, use:"
echo "   NEXT_PUBLIC_APP_URL=http://localhost:3000"
echo "   NEXTAUTH_URL=http://localhost:3000"
echo "   NEXTAUTH_SECRET=any-random-string-for-local-dev"
echo ""
echo "4. VERCEL DEPLOYMENT:"
echo "   After deploying to Vercel, update with:"
echo "   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app"
echo "   NEXTAUTH_URL=https://your-app.vercel.app"
echo "   NEXTAUTH_SECRET=your-production-secret"
echo ""

echo "🔧 Next Steps:"
echo "1. Edit .env.local with your Supabase keys"
echo "2. Run: npm run dev (to test locally)"
echo "3. Deploy to Vercel (we'll do this next)"
echo "4. Update Vercel environment variables"
echo ""

echo "📁 Current .env.local location: $(pwd)/.env.local"
echo ""
echo "💡 Tip: You can use any text editor to edit .env.local"
echo "   Example: nano .env.local or code .env.local" 