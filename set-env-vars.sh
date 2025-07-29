#!/bin/bash

# Set environment variables for Cloud Run service
# Update these values with your actual project details

PROJECT_ID="your-gcp-project-id"
SERVICE_NAME="jj-roofing-pros"
REGION="us-central1"

# Set the API key
gcloud run services update $SERVICE_NAME \
  --region $REGION \
  --project $PROJECT_ID \
  --set-env-vars="API_KEY=AIzaSyD57cUMy1CGH1GwrMfjkLO3XGekdg01gWc"

echo "Environment variable API_KEY has been set for $SERVICE_NAME"