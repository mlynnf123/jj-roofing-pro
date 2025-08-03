import { NextResponse } from 'next/server';
import { GroupMeService } from '@/services/groupmeService';

export async function GET() {
  try {
    const accessToken = process.env.GROUPME_ACCESS_TOKEN;
    
    if (!accessToken) {
      return NextResponse.json({
        status: 'error',
        message: 'GROUPME_ACCESS_TOKEN environment variable is not set',
        solution: 'Add GROUPME_ACCESS_TOKEN to your .env.local file'
      }, { status: 500 });
    }

    const groupMe = new GroupMeService(accessToken);
    
    // Get all bots
    const bots = await groupMe.getBots();
    
    // Check if any bots have the webhook URL pointing to this app
    const appUrl = process.env.VERCEL_URL || process.env.NEXT_PUBLIC_BASE_URL || 'localhost';
    const expectedWebhookPattern = /groupme-webhook/;
    
    const configuredBots = bots.filter(bot => 
      bot.callback_url && expectedWebhookPattern.test(bot.callback_url)
    );

    // Get recent messages from groups where bots are active
    const groupMessages: any[] = [];
    for (const bot of configuredBots) {
      try {
        const group = await groupMe.getGroup(bot.group_id);
        groupMessages.push({
          groupName: group.name,
          groupId: group.id,
          botName: bot.name,
          lastMessageTime: new Date(group.updated_at * 1000).toISOString(),
          messageCount: group.messages.count
        });
      } catch (error) {
        console.error(`Failed to get group info for ${bot.group_id}:`, error);
      }
    }

    return NextResponse.json({
      status: 'ok',
      accessTokenPresent: true,
      totalBots: bots.length,
      configuredBots: configuredBots.map(bot => ({
        name: bot.name,
        bot_id: bot.bot_id,
        group_id: bot.group_id,
        callback_url: bot.callback_url,
        isActive: bot.callback_url?.includes(appUrl) || false
      })),
      groupActivity: groupMessages,
      recommendations: [
        configuredBots.length === 0 ? 'No bots configured with webhook URLs. Create a bot using /api/groupme-setup' : null,
        configuredBots.some(bot => !bot.callback_url?.includes('https://')) ? 'Some bots have non-HTTPS webhook URLs' : null,
      ].filter(Boolean)
    });

  } catch (error) {
    console.error('GroupMe diagnostic error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Failed to connect to GroupMe API',
      error: error instanceof Error ? error.message : 'Unknown error',
      possibleCauses: [
        'Invalid or expired access token',
        'Network connectivity issues',
        'GroupMe API service issues'
      ]
    }, { status: 500 });
  }
}