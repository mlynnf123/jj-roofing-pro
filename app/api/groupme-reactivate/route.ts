import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const BOT_ID = '56cc13682b3403ff3c51f8d387';
    const ACCESS_TOKEN = process.env.GROUPME_ACCESS_TOKEN;
    const WEBHOOK_URL = 'https://jj-roofing-pro.vercel.app/api/groupme-webhook';
    
    if (!ACCESS_TOKEN) {
      return NextResponse.json({ 
        error: 'GROUPME_ACCESS_TOKEN not configured' 
      }, { status: 500 });
    }

    // Delete existing bot
    const deleteResponse = await fetch(
      `https://api.groupme.com/v3/bots/destroy?token=${ACCESS_TOKEN}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bot_id: BOT_ID })
      }
    );
    
    // Create new bot with same settings
    const createResponse = await fetch(
      `https://api.groupme.com/v3/bots?token=${ACCESS_TOKEN}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bot: {
            name: 'JJ Roofing Lead Bot',
            group_id: '107999529',
            callback_url: WEBHOOK_URL,
            avatar_url: 'https://i.imgur.com/afzTzOy.png'
          }
        })
      }
    );

    if (!createResponse.ok) {
      const error = await createResponse.text();
      return NextResponse.json({ 
        error: 'Failed to create bot',
        details: error
      }, { status: 500 });
    }

    const data = await createResponse.json();
    
    return NextResponse.json({
      success: true,
      message: 'Bot reactivated successfully',
      bot: data.response?.bot,
      webhookUrl: WEBHOOK_URL
    });
    
  } catch (error) {
    console.error('Bot reactivation error:', error);
    return NextResponse.json({ 
      error: 'Failed to reactivate bot',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'GroupMe Bot Reactivation Endpoint',
    usage: 'POST to this endpoint to delete and recreate the bot with fresh webhook configuration'
  });
}