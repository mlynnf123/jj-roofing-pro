# JJ Roofing Pros - Cloud Run Deployment Guide

## Prerequisites

1. **Google Cloud Project**: Create a project and enable the following APIs:
   - Cloud Run API
   - Container Registry API
   - Cloud Build API

2. **Gemini API Key**: Get your API key from Google AI Studio

3. **Firebase Project**: Make sure your Firebase project is set up and configured

## Environment Variables

The following environment variables must be set in Cloud Run:

### Required for Gemini AI
- `API_KEY`: Your Gemini API key from Google AI Studio

### Required for Firebase
- `NEXT_PUBLIC_FIREBASE_API_KEY`: Your Firebase API key
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`: Your Firebase auth domain
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`: Your Firebase project ID
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`: Your Firebase storage bucket
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`: Your Firebase messaging sender ID
- `NEXT_PUBLIC_FIREBASE_APP_ID`: Your Firebase app ID

## Deployment Steps

### Option 1: Using the Deploy Script

1. **Update the deploy script**:
   ```bash
   # Edit deploy.sh and set your PROJECT_ID
   PROJECT_ID="your-actual-project-id"
   ```

2. **Make the script executable**:
   ```bash
   chmod +x deploy.sh
   ```

3. **Run the deployment**:
   ```bash
   ./deploy.sh
   ```

### Option 2: Manual Deployment

1. **Build the Docker image**:
   ```bash
   docker build -t gcr.io/YOUR_PROJECT_ID/jj-roofing-pros .
   ```

2. **Push to Google Container Registry**:
   ```bash
   docker push gcr.io/YOUR_PROJECT_ID/jj-roofing-pros
   ```

3. **Deploy to Cloud Run**:
   ```bash
   gcloud run deploy jj-roofing-pros \
     --image gcr.io/YOUR_PROJECT_ID/jj-roofing-pros \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --port 3000 \
     --memory 512Mi \
     --cpu 1 \
     --min-instances 0 \
     --max-instances 10 \
     --set-env-vars="NODE_ENV=production"
   ```

4. **Set environment variables in Cloud Run Console**:
   - Go to Cloud Run console
   - Select your service
   - Click "Edit & Deploy New Revision"
   - Add all required environment variables listed above

## Troubleshooting Common Issues

### 1. GroupMe Webhook Failing
**Symptom**: GroupMe messages not being processed
**Solution**: Ensure `API_KEY` is set in Cloud Run environment variables

### 2. Firebase Connection Issues
**Symptom**: Database operations failing
**Solution**: Verify all Firebase environment variables are correctly set

### 3. Build Failures
**Symptom**: Docker build fails
**Solution**: Check for:
- Missing dependencies in package.json
- TypeScript errors
- Environment variable references

### 4. Memory/CPU Issues
**Symptom**: Service crashes or times out
**Solution**: Increase memory allocation:
```bash
gcloud run services update jj-roofing-pros \
  --memory 1Gi \
  --cpu 1
```

## Testing the Deployment

1. **Test the main page**: Visit your Cloud Run service URL
2. **Test the API endpoints**:
   - `POST /api/parse-lead` - Test lead parsing
   - `POST /api/groupme-webhook` - Test webhook processing
   - `GET /api/leads` - Test lead retrieval

## GroupMe Webhook Configuration

1. Go to your GroupMe bot settings
2. Set the webhook URL to: `https://YOUR_SERVICE_URL/api/groupme-webhook`
3. Test by sending a message with lead information

## Monitoring and Logs

View logs in Cloud Run console or use:
```bash
gcloud logs read --service=jj-roofing-pros --limit=50
```