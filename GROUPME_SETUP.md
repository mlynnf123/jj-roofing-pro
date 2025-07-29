# GroupMe Integration Setup Guide

## Overview
Your JJ Roofing Pros app now supports both **historical data collection** (past 3 weeks) and **real-time lead capture** from GroupMe chats.

## Step 1: Get GroupMe Access Token

1. **Go to**: https://dev.groupme.com/
2. **Sign in** with your GroupMe account
3. **Copy your Access Token** (at the top of the page)

## Step 2: Find Your Group Information

Use this API call to list all your groups:

```bash
curl -X POST https://jj-roofing-pros-app-795876782419.us-west1.run.app/api/groupme-setup \
  -H "Content-Type: application/json" \
  -d '{
    "accessToken": "YOUR_ACCESS_TOKEN_HERE",
    "action": "list-groups"
  }'
```

This will return all your groups with their IDs and basic info.

## Step 3: Create a Bot for Real-Time Collection

```bash
curl -X POST https://jj-roofing-pros-app-795876782419.us-west1.run.app/api/groupme-setup \
  -H "Content-Type: application/json" \
  -d '{
    "accessToken": "YOUR_ACCESS_TOKEN_HERE",
    "action": "create-bot",
    "groupId": "YOUR_GROUP_ID_HERE",
    "botName": "JJ Roofing Lead Collector"
  }'
```

This will:
- ✅ Create a bot in your GroupMe group
- ✅ Automatically configure the webhook URL
- ✅ Start collecting new messages immediately

## Step 4: Collect Historical Data (Past 3 Weeks)

```bash
curl -X POST https://jj-roofing-pros-app-795876782419.us-west1.run.app/api/groupme-history \
  -H "Content-Type: application/json" \
  -d '{
    "groupId": "YOUR_GROUP_ID_HERE",
    "accessToken": "YOUR_ACCESS_TOKEN_HERE",
    "daysBack": 21
  }'
```

This will:
- 📥 Fetch all messages from the past 21 days
- 🤖 Process them with AI to identify leads
- 💾 Save valid leads to your database
- 📊 Return a summary of processed leads

## What Gets Collected

### ✅ **Messages That Become Leads:**
- Contain address information (street names, numbers)
- Mention damage, claims, or repair needs
- Have first/last name information
- Are from real users (not bots)

### ❌ **Messages That Are Ignored:**
- Bot messages (including your new bot)
- System messages
- Messages without addresses
- Messages shorter than 10 characters

## AI Processing

Each potential lead is processed with Gemini AI to extract:
- **firstName**: Customer's first name
- **lastName**: Customer's last name  
- **address**: Property address
- **claimInfo**: Insurance claim details
- **time**: Appointment or time mentions

## Example API Responses

### Group List Response:
```json
{
  "groups": [
    {
      "id": "12345678",
      "name": "Roofing Team Chat",
      "memberCount": 15,
      "messageCount": 1247,
      "lastActivity": "2025-07-07T10:30:00.000Z"
    }
  ]
}
```

### Bot Creation Response:
```json
{
  "success": true,
  "bot": {
    "bot_id": "abc123def456",
    "name": "JJ Roofing Lead Collector",
    "group_id": "12345678"
  },
  "webhookUrl": "https://jj-roofing-pros-app-795876782419.us-west1.run.app/api/groupme-webhook"
}
```

### Historical Processing Response:
```json
{
  "success": true,
  "summary": {
    "totalMessages": 342,
    "potentialLeads": 28,
    "processedLeads": 15,
    "errors": 2
  },
  "processedLeads": [
    {
      "messageId": "msg123",
      "sender": "Field Tech Mike",
      "lead": {
        "firstName": "John",
        "lastName": "Smith",
        "address": "123 Main Street",
        "claimInfo": "storm damage"
      }
    }
  ]
}
```

## Real-Time Collection

Once your bot is created, it will automatically:
- 🔄 Receive all new messages instantly
- 🤖 Process them with AI
- 💾 Save valid leads to your app
- 🚫 Ignore bot messages and invalid content

## Testing

### Test the Setup:
```bash
# List your bots
curl -X POST https://jj-roofing-pros-app-795876782419.us-west1.run.app/api/groupme-setup \
  -H "Content-Type: application/json" \
  -d '{"accessToken": "YOUR_TOKEN", "action": "list-bots"}'

# Get group details
curl -X POST https://jj-roofing-pros-app-795876782419.us-west1.run.app/api/groupme-setup \
  -H "Content-Type: application/json" \
  -d '{"accessToken": "YOUR_TOKEN", "action": "get-group-info", "groupId": "YOUR_GROUP_ID"}'
```

### Test Lead Processing:
Send a message like this in your GroupMe group:
```
"John Smith at 123 Main Street needs roof repair, storm damage claim"
```

Check your app - it should appear as a new lead!

## Rate Limits & Considerations

- **Historical processing**: ~200ms delay between AI calls
- **GroupMe API**: 100 messages per request, respectful delays
- **Real-time**: Instant processing with 5-second timeout
- **Fallback**: Manual parsing if AI fails

## Troubleshooting

### Bot Not Receiving Messages:
- Check the webhook URL in GroupMe developer console
- Verify bot is active in the group

### No Leads Being Created:
- Check Cloud Run logs for processing details
- Ensure messages contain address information
- Verify AI parsing is working with `/api/parse-lead`

### API Errors:
- Verify your access token is valid
- Check group ID exists and you have access
- Ensure GroupMe account has proper permissions

## Next Steps

1. **Run the setup commands** with your actual tokens/IDs
2. **Test with historical data** to see past leads
3. **Monitor real-time collection** as new messages come in
4. **Review and manage leads** in your web app

Your GroupMe integration is now fully automated! 🚀