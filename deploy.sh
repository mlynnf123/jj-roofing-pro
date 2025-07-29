#!/bin/bash

# JJ Roofing Pros - Cloud Run Deployment Script
# Make sure to set your environment variables before running

# Configuration
PROJECT_ID="servicepro-crm"
SERVICE_NAME="jj-roofing-pros"
REGION="us-west1"
IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting deployment of JJ Roofing Pros to Cloud Run...${NC}"

# Check if required environment variables are set
if [ -z "$PROJECT_ID" ] || [ "$PROJECT_ID" = "your-gcp-project-id" ]; then
    echo -e "${RED}Error: Please set PROJECT_ID in this script${NC}"
    exit 1
fi

# Build and push Docker image
echo -e "${YELLOW}Building Docker image...${NC}"
docker build -t $IMAGE_NAME .

if [ $? -ne 0 ]; then
    echo -e "${RED}Docker build failed${NC}"
    exit 1
fi

echo -e "${YELLOW}Pushing Docker image to Google Container Registry...${NC}"
docker push $IMAGE_NAME

if [ $? -ne 0 ]; then
    echo -e "${RED}Docker push failed${NC}"
    exit 1
fi

# Deploy to Cloud Run
echo -e "${YELLOW}Deploying to Cloud Run...${NC}"
gcloud run deploy $SERVICE_NAME \
    --image $IMAGE_NAME \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --port 3000 \
    --memory 512Mi \
    --cpu 1 \
    --min-instances 0 \
    --max-instances 10 \
    --set-env-vars="NODE_ENV=production,API_KEY=$GEMINI_API_KEY,ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY" \
    --project $PROJECT_ID

if [ $? -eq 0 ]; then
    echo -e "${GREEN}Deployment successful!${NC}"
    echo -e "${GREEN}Service URL: https://$SERVICE_NAME-$REGION-$PROJECT_ID.a.run.app${NC}"
else
    echo -e "${RED}Deployment failed${NC}"
    exit 1
fi

echo -e "${YELLOW}Don't forget to set your environment variables in Cloud Run console:${NC}"
echo -e "- API_KEY (Gemini API key)"
echo -e "- ANTHROPIC_API_KEY (Claude API key)"
echo -e "- NEXT_PUBLIC_FIREBASE_* (Firebase config)"
echo -e ""
echo -e "${YELLOW}For local deployment, set these environment variables:${NC}"
echo -e "export GEMINI_API_KEY='your-gemini-api-key'"
echo -e "export ANTHROPIC_API_KEY='your-anthropic-api-key'"