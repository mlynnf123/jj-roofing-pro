import { NextResponse } from 'next/server';
import { GroupMeService } from '@/services/groupmeService';

export async function POST(request: Request) {
  try {
    const { accessToken, action, groupId, botName } = await request.json();

    if (!accessToken) {
      return NextResponse.json({ 
        message: "Access token is required" 
      }, { status: 400 });
    }

    const groupMe = new GroupMeService(accessToken);

    switch (action) {
      case 'list-groups':
        const groups = await groupMe.getGroups();
        return NextResponse.json({
          groups: groups.map(g => ({
            id: g.id,
            name: g.name,
            description: g.description,
            memberCount: g.members.length,
            messageCount: g.messages.count,
            lastActivity: new Date(g.updated_at * 1000).toISOString()
          }))
        });

      case 'list-bots':
        const bots = await groupMe.getBots();
        return NextResponse.json({
          bots: bots.map(b => ({
            bot_id: b.bot_id,
            name: b.name,
            group_id: b.group_id,
            callback_url: b.callback_url
          }))
        });

      case 'create-bot':
        if (!groupId || !botName) {
          return NextResponse.json({ 
            message: "groupId and botName are required for bot creation" 
          }, { status: 400 });
        }

        // Get the current service URL for webhook
        const host = request.headers.get('host');
        const protocol = request.headers.get('x-forwarded-proto') || 'https';
        const webhookUrl = `${protocol}://${host}/api/groupme-webhook`;

        const newBot = await groupMe.createBot(
          groupId, 
          botName, 
          webhookUrl,
          'https://i.imgur.com/afzTzOy.png' // Optional: roofing-themed avatar
        );

        return NextResponse.json({
          success: true,
          bot: newBot,
          webhookUrl,
          message: `Bot "${botName}" created successfully in group ${groupId}`
        });

      case 'get-group-info':
        if (!groupId) {
          return NextResponse.json({ 
            message: "groupId is required" 
          }, { status: 400 });
        }

        const group = await groupMe.getGroup(groupId);
        return NextResponse.json({
          group: {
            id: group.id,
            name: group.name,
            description: group.description,
            memberCount: group.members.length,
            members: group.members.map(m => ({
              id: m.id,
              nickname: m.nickname,
              user_id: m.user_id
            })),
            messageCount: group.messages.count,
            lastMessageId: group.messages.last_message_id,
            lastActivity: new Date(group.updated_at * 1000).toISOString()
          }
        });

      default:
        return NextResponse.json({ 
          message: "Invalid action. Supported: list-groups, list-bots, create-bot, get-group-info" 
        }, { status: 400 });
    }

  } catch (error) {
    console.error("GroupMe setup error:", error);
    return NextResponse.json({ 
      message: "GroupMe setup failed", 
      error: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: "GroupMe Setup & Management",
    endpoints: {
      "POST /api/groupme-setup": {
        "list-groups": "Get all groups you have access to",
        "list-bots": "Get all your bots",
        "create-bot": "Create a new bot (requires groupId, botName)",
        "get-group-info": "Get detailed group information (requires groupId)"
      },
      "POST /api/groupme-history": "Fetch and process historical messages",
      "POST /api/groupme-webhook": "Real-time webhook for new messages"
    },
    instructions: {
      accessToken: "Get from https://dev.groupme.com/",
      webhook: "Automatically configured when creating bot",
      usage: "1. List groups, 2. Create bot, 3. Fetch history, 4. Collect real-time"
    }
  });
}