# Vercel Deployment Guide for JJ Roofing Pros

## Quick Setup

### 1. Environment Variables in Vercel Dashboard

Set these environment variables in your Vercel project dashboard:

#### Firebase Configuration (Required)
```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDqCgh2PLiU1IJ1KG4RCmNuwU5lutC4hno
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=jj-pro-10d5b.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=jj-pro-10d5b
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=jj-pro-10d5b.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=288788142267
NEXT_PUBLIC_FIREBASE_APP_ID=1:288788142267:web:94bee34a49f7d761d1b19e
```

#### AI Services (Set as secrets)
```
ANTHROPIC_API_KEY=your_claude_api_key_here
API_KEY=your_gemini_api_key_here
```

#### GroupMe Integration (Optional)
```
GROUPME_ACCESS_TOKEN=your_groupme_access_token
```

### 2. Deploy to Vercel

#### Option A: Automatic Deployment
1. Push to your main branch
2. Vercel will automatically deploy

#### Option B: Manual Deployment
```bash
npm install -g vercel
vercel --prod
```

### 3. Set Up GroupMe Webhook

After deployment, set your GroupMe webhook URL to:
```
https://your-vercel-domain.vercel.app/api/groupme-webhook
```

## Troubleshooting

### Data Not Saving
1. Check Vercel Function Logs in dashboard
2. Verify Firebase environment variables are set
3. Check Firestore security rules allow writes

### GroupMe Webhook Not Working
1. Verify webhook URL in GroupMe bot settings
2. Check GROUPME_ACCESS_TOKEN is set in Vercel
3. Test webhook manually with curl

### Build Failures
1. Check for missing dependencies
2. Verify all environment variables are set
3. Check Vercel function logs for detailed errors

## Key Differences from Cloud Run

1. **Environment Variables**: Set in Vercel dashboard, not .env files
2. **Function Timeout**: 30 seconds max (configured in vercel.json)
3. **Automatic Deployments**: Triggered by git pushes
4. **Logs**: Available in Vercel dashboard under Functions tab