# JJ Roofing Pros - Deployment Instructions

## Prerequisites

1. **Install Google Cloud CLI** (if not already installed):
   ```bash
   curl https://sdk.cloud.google.com | bash
   exec -l $SHELL
   ```

2. **Authenticate with Google Cloud**:
   ```bash
   gcloud auth login
   ```

3. **Set your project**:
   ```bash
   gcloud config set project servicepro-crm
   ```

4. **Enable required APIs**:
   ```bash
   gcloud services enable cloudbuild.googleapis.com run.googleapis.com containerregistry.googleapis.com
   ```

## Deployment Options

### Option 1: Using Cloud Build (Recommended - No Docker needed)
```bash
gcloud builds submit --config cloudbuild.yaml --project servicepro-crm
```

### Option 2: Using Local Docker (if Docker is running)
```bash
./deploy.sh
```

### Option 3: Manual Steps
1. **Build and push image**:
   ```bash
   gcloud builds submit --tag gcr.io/servicepro-crm/jj-roofing-pros
   ```

2. **Deploy to Cloud Run**:
   ```bash
   gcloud run deploy jj-roofing-pros \
     --image gcr.io/servicepro-crm/jj-roofing-pros \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --port 3000 \
     --memory 512Mi \
     --cpu 1 \
     --min-instances 0 \
     --max-instances 10 \
     --set-env-vars="NODE_ENV=production,API_KEY=AIzaSyD57cUMy1CGH1GwrMfjkLO3XGekdg01gWc"
   ```

## After Deployment

1. **Get your service URL**:
   ```bash
   gcloud run services describe jj-roofing-pros --region us-central1 --format="value(status.url)"
   ```

2. **Test the deployment**:
   ```bash
   curl https://YOUR_SERVICE_URL/api/leads
   ```

3. **Test GroupMe webhook**:
   ```bash
   curl -X POST https://YOUR_SERVICE_URL/api/groupme-webhook \
     -H "Content-Type: application/json" \
     -d '{"text": "John Smith at 123 Main Street, storm damage", "name": "Test User"}'
   ```

## GroupMe Bot Setup

1. Go to [GroupMe Dev Portal](https://dev.groupme.com/)
2. Create a new bot in your group
3. Set webhook URL to: `https://YOUR_SERVICE_URL/api/groupme-webhook`
4. Test by sending a message with lead info in your GroupMe group

## Troubleshooting

- **Authentication issues**: Run `gcloud auth login` and ensure you're using the correct account
- **Permission errors**: Make sure your account has Cloud Run Admin and Cloud Build Editor roles
- **Build failures**: Check the build logs in Google Cloud Console > Cloud Build

## Environment Variables Set

The deployment includes these environment variables:
- `NODE_ENV=production`
- `API_KEY=AIzaSyD57cUMy1CGH1GwrMfjkLO3XGekdg01gWc` (Gemini API key)

Firebase configuration is handled through `NEXT_PUBLIC_*` variables in the build.