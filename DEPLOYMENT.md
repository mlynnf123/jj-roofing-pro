# JJ Roofing Pros - Vercel Deployment Guide

## Current Deployment

**✅ Deployed on Vercel**: https://jj-roofing-pro.vercel.app

## Prerequisites

1. **Vercel Account**: Connected to GitHub repository
2. **Gemini API Key**: Get your API key from Google AI Studio
3. **Firebase Project**: For data persistence
4. **GroupMe Access Token**: For webhook integration

## Environment Variables (Set in Vercel Dashboard)

```env
# AI Processing
API_KEY=your_gemini_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# GroupMe Integration
GROUPME_ACCESS_TOKEN=your_groupme_token
```

## Deployment Process

1. **Push to GitHub**: All changes automatically deploy via Vercel
2. **Environment Variables**: Set in Vercel dashboard under Project Settings
3. **Custom Domain**: Configure in Vercel if needed

## Active Integrations

- **GroupMe Bot**: "JJ Roofing Lead Bot" configured for real-time lead processing
- **Webhook URL**: https://jj-roofing-pro.vercel.app/api/groupme-webhook
- **Firebase**: Live database for lead persistence

## API Endpoints

- `/api/leads` - CRUD operations for leads
- `/api/groupme-webhook` - Real-time message processing
- `/api/groupme-history` - Historical message processing
- `/api/parse-lead` - AI lead parsing

## Monitoring

- **Vercel Dashboard**: Monitor deployments and function performance
- **Firebase Console**: Monitor database usage
- **Logs**: Available in Vercel Functions tab