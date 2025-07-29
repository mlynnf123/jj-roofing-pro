import { NextResponse } from 'next/server';
import { parseLeadInfoWithGemini } from '@/services/geminiService';
import { saveLeadToDatabase } from '@/lib/firebaseUtils';
import { Lead, LeadStage } from '@/types';

interface GroupMeMessage {
  id: string;
  source_guid: string;
  created_at: number;
  user_id: string;
  group_id: string;
  name: string;
  avatar_url: string;
  text: string;
  system: boolean;
  favorited_by: string[];
  attachments: any[];
}

interface GroupMeHistoryResponse {
  response: {
    messages: GroupMeMessage[];
    count: number;
  };
}

export async function POST(request: Request) {
  try {
    const { groupId, accessToken, daysBack = 21 } = await request.json();
    
    if (!groupId || !accessToken) {
      return NextResponse.json({ 
        message: "groupId and accessToken are required" 
      }, { status: 400 });
    }

    console.log(`Fetching GroupMe history for group ${groupId}, ${daysBack} days back`);

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);
    const cutoffTimestamp = Math.floor(cutoffDate.getTime() / 1000);

    let allMessages: GroupMeMessage[] = [];
    let lastMessageId: string | null = null;
    let hasMoreMessages = true;
    let totalFetched = 0;

    // Fetch messages in batches
    while (hasMoreMessages && totalFetched < 1000) { // Safety limit
      const url = new URL(`https://api.groupme.com/v3/groups/${groupId}/messages`);
      url.searchParams.set('token', accessToken);
      url.searchParams.set('limit', '100');
      
      if (lastMessageId) {
        url.searchParams.set('before_id', lastMessageId);
      }

      console.log(`Fetching batch starting from message ${lastMessageId || 'latest'}`);

      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`GroupMe API error: ${response.status} ${response.statusText}`);
      }

      const data: GroupMeHistoryResponse = await response.json();
      const messages = data.response.messages;

      if (!messages || messages.length === 0) {
        hasMoreMessages = false;
        break;
      }

      // Filter messages within our date range
      const recentMessages = messages.filter(msg => msg.created_at >= cutoffTimestamp);
      
      if (recentMessages.length < messages.length) {
        // We've reached messages older than our cutoff
        allMessages.push(...recentMessages);
        hasMoreMessages = false;
      } else {
        allMessages.push(...messages);
        lastMessageId = messages[messages.length - 1].id;
        totalFetched += messages.length;
      }

      // Small delay to be respectful to API
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`Fetched ${allMessages.length} messages total`);

    // Filter for potential leads (exclude system messages, bots, empty text)
    const potentialLeads = allMessages.filter(msg => 
      !msg.system && 
      msg.text && 
      msg.text.trim().length > 10 &&
      !msg.name.toLowerCase().includes('bot') &&
      // Look for address-like patterns
      (/\d+.*(?:st|street|ave|avenue|rd|road|dr|drive|blvd|boulevard|ln|lane)/i.test(msg.text) ||
       /address|location|at\s+\d+/i.test(msg.text) ||
       /claim|damage|roof|repair/i.test(msg.text))
    );

    console.log(`Found ${potentialLeads.length} potential leads`);

    const processedLeads: any[] = [];
    const errors: any[] = [];

    // Process potential leads with AI
    for (const message of potentialLeads) {
      try {
        console.log(`Processing message from ${message.name}: "${message.text.substring(0, 100)}..."`);
        
        const parsedData = await parseLeadInfoWithGemini(message.text);
        
        if (parsedData.firstName && parsedData.lastName && parsedData.address) {
          const now = new Date(message.created_at * 1000).toISOString();
          
          const newLead: Lead = {
            id: `groupme-${message.id}`,
            timestamp: now,
            stage: LeadStage.NEW_LEAD,
            lastStageUpdateTimestamp: now,
            sender: `${message.name} (Historical)`,
            originalMessage: message.text,
            documents: [],
            firstName: parsedData.firstName,
            lastName: parsedData.lastName,
            address: parsedData.address,
            ...(parsedData.time && { time: parsedData.time }),
            ...(parsedData.claimInfo && { claimInfo: parsedData.claimInfo }),
          };

          try {
            await saveLeadToDatabase(newLead);
            processedLeads.push({
              messageId: message.id,
              sender: message.name,
              timestamp: now,
              lead: newLead
            });
            console.log(`✅ Saved lead: ${newLead.firstName} ${newLead.lastName}`);
          } catch (saveError) {
            console.error(`❌ Failed to save lead:`, saveError);
            errors.push({
              messageId: message.id,
              error: saveError instanceof Error ? saveError.message : 'Unknown save error',
              parsedData
            });
          }
        } else {
          console.log(`⚠️ Incomplete lead data for message ${message.id}`);
        }

        // Rate limiting for AI API
        await new Promise(resolve => setTimeout(resolve, 200));

      } catch (parseError) {
        console.error(`❌ Failed to parse message ${message.id}:`, parseError);
        errors.push({
          messageId: message.id,
          error: parseError instanceof Error ? parseError.message : 'Unknown parse error',
          text: message.text.substring(0, 200)
        });
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        totalMessages: allMessages.length,
        potentialLeads: potentialLeads.length,
        processedLeads: processedLeads.length,
        errors: errors.length
      },
      processedLeads,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error("Error processing GroupMe history:", error);
    return NextResponse.json({ 
      message: "Error processing GroupMe history", 
      error: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: "GroupMe History Processor",
    usage: "POST with { groupId, accessToken, daysBack? }",
    description: "Fetches and processes historical GroupMe messages for leads"
  });
}