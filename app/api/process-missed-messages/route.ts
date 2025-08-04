import { NextResponse } from 'next/server';
import { GroupMeService } from '@/services/groupmeService';
import { parseLeadInfoWithGemini } from '@/services/improvedLeadParser';
import { saveLeadToDatabase } from '@/lib/firebaseUtils';
import { checkForDuplicateLead, updateLead } from '@/lib/data';
import { Lead, LeadStage } from '@/types';

interface GroupMeMessage {
  id: string;
  created_at: number;
  user_id: string;
  name: string;
  text: string;
  sender_type: string;
}

async function fetchGroupMessages(groupId: string, accessToken: string, limit: number = 100): Promise<GroupMeMessage[]> {
  const url = `https://api.groupme.com/v3/groups/${groupId}/messages?token=${accessToken}&limit=${limit}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch messages: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.response.messages || [];
}

async function processMessage(message: GroupMeMessage): Promise<Lead | null> {
  try {
    // Skip bot messages
    if (message.sender_type === 'bot' || message.name === 'GroupMe' || 
        message.name === 'RoofingBot' || message.name === 'AI Lead Parser' ||
        message.name === 'JJ Roofing Lead Bot') {
      console.log(`Skipping bot message from ${message.name}`);
      return null;
    }
    
    // Skip messages without meaningful text
    if (!message.text || message.text.length < 10) {
      console.log(`Skipping short message: "${message.text}"`);
      return null;
    }
    
    // Parse the message
    console.log(`Processing message from ${message.name}: "${message.text.substring(0, 100)}..."`);
    const parsedData = await parseLeadInfoWithGemini(message.text);
    
    if (!parsedData.firstName || !parsedData.lastName) {
      console.log('Could not extract customer name from message');
      return null;
    }
    
    // Check for duplicates
    const duplicateLead = await checkForDuplicateLead(
      parsedData.firstName,
      parsedData.lastName,
      parsedData.address || ''
    );
    
    if (duplicateLead) {
      console.log(`Duplicate lead found: ${parsedData.firstName} ${parsedData.lastName}`);
      return null;
    }
    
    // Create the lead
    const messageDate = new Date(message.created_at * 1000).toISOString();
    const newLead: Lead = {
      id: `gm_${message.id}`,
      timestamp: messageDate,
      stage: LeadStage.NEW_LEAD,
      lastStageUpdateTimestamp: messageDate,
      sender: message.name,
      originalMessage: message.text,
      documents: [],
      firstName: parsedData.firstName,
      lastName: parsedData.lastName,
      address: parsedData.address || 'Address not specified',
      phoneNumber: parsedData.phoneNumber || 'Phone not specified',
      claimNumber: parsedData.claimNumber || 'Claim number not specified',
      claimCompany: parsedData.claimCompany || 'Insurance company not specified',
      nextSetDate: parsedData.nextSetDate,
      ...(parsedData.time && { time: parsedData.time }),
      ...(parsedData.claimInfo && { claimInfo: parsedData.claimInfo }),
    };
    
    return newLead;
    
  } catch (error) {
    console.error(`Error processing message: ${error}`);
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const { hoursBack = 24 } = await request.json();
    const accessToken = process.env.GROUPME_ACCESS_TOKEN;
    
    if (!accessToken) {
      return NextResponse.json({
        message: 'GROUPME_ACCESS_TOKEN not configured'
      }, { status: 500 });
    }
    
    // Get bot info to find the group
    const groupMe = new GroupMeService(accessToken);
    const bots = await groupMe.getBots();
    const roofingBot = bots.find(bot => bot.callback_url?.includes('groupme-webhook'));
    
    if (!roofingBot) {
      return NextResponse.json({
        message: 'No bot configured for webhook'
      }, { status: 500 });
    }
    
    // Fetch recent messages
    const messages = await fetchGroupMessages(roofingBot.group_id, accessToken, 100);
    
    // Filter messages from the specified time period
    const cutoffTime = Date.now() - (hoursBack * 60 * 60 * 1000);
    const recentMessages = messages.filter(msg => 
      (msg.created_at * 1000) > cutoffTime
    );
    
    console.log(`Found ${recentMessages.length} messages from last ${hoursBack} hours`);
    
    // Process each message
    const results = {
      totalMessages: recentMessages.length,
      processedMessages: 0,
      newLeadsCreated: 0,
      duplicatesSkipped: 0,
      failedToProcess: 0,
      leads: [] as any[]
    };
    
    for (const message of recentMessages) {
      try {
        const lead = await processMessage(message);
        
        if (lead) {
          // Save to database
          await saveLeadToDatabase(lead);
          results.newLeadsCreated++;
          results.leads.push({
            name: `${lead.firstName} ${lead.lastName}`,
            address: lead.address,
            timestamp: lead.timestamp
          });
          console.log(`Created lead: ${lead.firstName} ${lead.lastName}`);
        } else {
          results.duplicatesSkipped++;
        }
        
        results.processedMessages++;
        
      } catch (error) {
        console.error(`Failed to process message: ${error}`);
        results.failedToProcess++;
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Processed ${results.processedMessages} messages`,
      results
    });
    
  } catch (error) {
    console.error('Error processing missed messages:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to process missed messages',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Process Missed Messages Endpoint',
    usage: 'POST with { hoursBack: number }',
    description: 'Fetches and processes GroupMe messages from the past N hours'
  });
}