# 🚀 Vercel Deployment Guide

## 📋 Prerequisites
- ✅ GitHub repository (already done: `nxgdevllc/proj-spbr-booking`)
- ✅ Supabase project created
- ✅ Environment variables configured locally

## 🔧 Step-by-Step Deployment

### **Step 1: Connect to Vercel**

1. **Go to [vercel.com](https://vercel.com)**
2. **Sign in with GitHub** (use your `nxgdevllc` account)
3. **Click "New Project"**
4. **Import your repository**: `nxgdevllc/proj-spbr-booking`
5. **Click "Import"**

### **Step 2: Configure Project Settings**

**Framework Preset**: Next.js (should auto-detect)
**Root Directory**: `./` (leave as default)
**Build Command**: `npm run build` (should auto-detect)
**Output Directory**: `.next` (should auto-detect)
**Install Command**: `npm install` (should auto-detect)

### **Step 3: Set Environment Variables (BEFORE DEPLOYING)**

**Important**: Set these BEFORE clicking "Deploy"!

1. **Click "Environment Variables"** section
2. **Add each variable**:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-random-secret-here
NEXTAUTH_URL=https://your-app.vercel.app
```

**Note**: Replace `your-app.vercel.app` with your actual Vercel URL (you'll get this after deployment)

### **Step 4: Deploy**

1. **Click "Deploy"**
2. **Wait for build** (2-3 minutes)
3. **Your app will be live** at: `https://your-app.vercel.app`

### **Step 5: Update Environment Variables with Real URL**

After deployment, you'll get your actual Vercel URL. Update these variables:

1. **Go to your project settings** in Vercel
2. **Environment Variables** section
3. **Update these values**:
   - `NEXT_PUBLIC_APP_URL=https://your-actual-app.vercel.app`
   - `NEXTAUTH_URL=https://your-actual-app.vercel.app`
4. **Redeploy** (Vercel will auto-redeploy when you update env vars)

## 🔗 Post-Deployment Setup

### **Step 6: Update Supabase Redirect URLs**

1. **Go to Supabase** → **Authentication** → **Settings**
2. **Add redirect URL**: `https://your-actual-app.vercel.app/auth/callback`

### **Step 7: Test Your Application**

1. **Visit**: `https://your-actual-app.vercel.app`
2. **Go to**: `/admin/dashboard`
3. **Test data import**: `/admin/data-import`
4. **Test data manager**: `/admin/data-manager`

## 🎯 Quick Deployment Commands

If you prefer command line deployment:

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts to configure
```

## 🔧 Troubleshooting

### **Build Fails**
- Check environment variables are set correctly
- Ensure all dependencies are in `package.json`
- Check build logs for specific errors

### **Database Connection Fails**
- Verify Supabase URL and keys are correct
- Check if database schema was applied
- Ensure RLS policies are configured

### **Environment Variables Not Working**
- Make sure variables are set in Vercel dashboard
- Redeploy after updating environment variables
- Check variable names match exactly

## 📱 Expected Timeline
- **Vercel Setup**: 5-10 minutes
- **Environment Configuration**: 5 minutes
- **Deployment**: 2-3 minutes
- **Testing**: 5-10 minutes
- **Total**: ~15-25 minutes

## 🎉 Success Indicators
- ✅ Build completes without errors
- ✅ App loads at Vercel URL
- ✅ Admin dashboard accessible
- ✅ Database connection working
- ✅ Data import functional

## 🔄 Next Steps After Deployment
1. **Import your CSV data** using the data import tool
2. **Test the data manager** with your imported data
3. **Configure authentication** if needed
4. **Set up custom domain** (optional)

---

**Need help?** Check the Vercel deployment logs or Supabase connection status in your application. 