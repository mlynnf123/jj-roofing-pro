import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Store recent webhook calls in memory for debugging
const recentWebhooks: any[] = [];
const MAX_STORED = 20;

export async function POST(request: Request) {
  try {
    const timestamp = new Date().toISOString();
    const headers = Object.fromEntries(request.headers.entries());
    const body = await request.json();
    
    // Log to console
    console.log('=== GROUPME WEBHOOK RECEIVED ===');
    console.log('Timestamp:', timestamp);
    console.log('Headers:', JSON.stringify(headers, null, 2));
    console.log('Body:', JSON.stringify(body, null, 2));
    console.log('================================');
    
    // Store in memory
    const webhookData = {
      timestamp,
      headers,
      body,
      processed: false
    };
    
    recentWebhooks.unshift(webhookData);
    if (recentWebhooks.length > MAX_STORED) {
      recentWebhooks.pop();
    }
    
    // Log to file for persistent debugging
    try {
      const logDir = path.join(process.cwd(), 'logs');
      await fs.mkdir(logDir, { recursive: true });
      
      const logFile = path.join(logDir, `webhook-${Date.now()}.json`);
      await fs.writeFile(logFile, JSON.stringify(webhookData, null, 2));
    } catch (error) {
      console.error('Failed to write log file:', error);
    }
    
    // Return success immediately
    return NextResponse.json({ 
      message: "Webhook received and logged",
      timestamp 
    }, { status: 200 });
    
  } catch (error) {
    console.error('Webhook test error:', error);
    return NextResponse.json({ 
      message: "Webhook test failed",
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 200 }); // Still return 200 to prevent retries
  }
}

export async function GET() {
  return NextResponse.json({
    message: "GroupMe Webhook Test Endpoint",
    recentWebhooks: recentWebhooks.map(wh => ({
      timestamp: wh.timestamp,
      senderName: wh.body?.name,
      text: wh.body?.text?.substring(0, 100) + (wh.body?.text?.length > 100 ? '...' : ''),
      groupId: wh.body?.group_id,
      messageId: wh.body?.id
    })),
    totalReceived: recentWebhooks.length,
    instruction: "This endpoint logs all incoming webhooks. Check console and /logs directory for details."
  });
}