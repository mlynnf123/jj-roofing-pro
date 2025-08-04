import { NextResponse } from 'next/server';
import { GroupMeService } from '@/services/groupmeService';
import { getLeads } from '@/lib/data';

export async function GET() {
  try {
    const accessToken = process.env.GROUPME_ACCESS_TOKEN;
    
    if (!accessToken) {
      return NextResponse.json({
        status: 'error',
        message: 'GROUPME_ACCESS_TOKEN not configured'
      }, { status: 500 });
    }

    const groupMe = new GroupMeService(accessToken);
    
    // Get bot info
    const bots = await groupMe.getBots();
    const roofingBot = bots.find(bot => 
      bot.callback_url?.includes('groupme-webhook')
    );
    
    if (!roofingBot) {
      return NextResponse.json({
        status: 'error',
        message: 'No bot configured with webhook URL'
      }, { status: 500 });
    }

    // Get recent messages from the group
    const group = await groupMe.getGroup(roofingBot.group_id);
    
    // Get leads from database
    const leads = await getLeads();
    
    // Get last 24 hours of activity
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    const recentLeads = leads.filter(lead => 
      new Date(lead.timestamp).getTime() > oneDayAgo
    );
    
    // Analyze webhook health
    const health = {
      status: 'healthy' as 'healthy' | 'warning' | 'error',
      bot: {
        name: roofingBot.name,
        id: roofingBot.bot_id,
        groupId: roofingBot.group_id,
        webhookUrl: roofingBot.callback_url,
        isConfigured: true
      },
      group: {
        name: group.name,
        lastMessageTime: new Date(group.updated_at * 1000).toISOString(),
        totalMessages: group.messages.count
      },
      processing: {
        leadsLast24Hours: recentLeads.length,
        totalLeadsInDatabase: leads.length,
        lastLeadCreated: leads.length > 0 ? leads[0].timestamp : 'No leads yet'
      },
      webhookUrl: roofingBot.callback_url,
      recommendations: [] as string[]
    };
    
    // Add recommendations if issues detected
    if (recentLeads.length === 0 && group.messages.count > 0) {
      health.recommendations.push('No leads created in last 24 hours despite group activity');
      health.status = 'warning';
    }
    
    if (!roofingBot.callback_url?.includes('vercel.app')) {
      health.recommendations.push('Webhook URL not pointing to production Vercel deployment');
      health.status = 'warning';
    }
    
    return NextResponse.json(health);
    
  } catch (error) {
    console.error('Webhook health check error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Failed to check webhook health',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { action } = await request.json();
    
    if (action === 'test-webhook') {
      // Send a test message to trigger the webhook
      const testResponse = await fetch('https://jj-roofing-pro.vercel.app/api/groupme-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: 'TEST LEAD: John Smith at 123 Test St, needs roof inspection',
          name: 'Webhook Test',
          group_id: '107999529',
          sender_type: 'user'
        })
      });
      
      return NextResponse.json({
        testSent: true,
        webhookResponse: testResponse.status,
        message: 'Test webhook sent. Check leads page for new test lead.'
      });
    }
    
    return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
    
  } catch (error) {
    return NextResponse.json({
      message: 'Test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}