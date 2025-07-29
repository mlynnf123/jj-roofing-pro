export interface GroupMeGroup {
  id: string;
  name: string;
  description: string;
  image_url: string;
  creator_user_id: string;
  created_at: number;
  updated_at: number;
  members: GroupMeMember[];
  messages: {
    count: number;
    last_message_id: string;
    last_message_created_at: number;
  };
}

export interface GroupMeMember {
  user_id: string;
  nickname: string;
  image_url: string;
  id: string;
  muted: boolean;
  autokicked: boolean;
}

export interface GroupMeBot {
  bot_id: string;
  group_id: string;
  name: string;
  callback_url: string;
  avatar_url?: string;
  dm_notification: boolean;
}

export class GroupMeService {
  private accessToken: string;
  private baseUrl = 'https://api.groupme.com/v3';

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  async getGroups(): Promise<GroupMeGroup[]> {
    const response = await fetch(`${this.baseUrl}/groups?token=${this.accessToken}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch groups: ${response.statusText}`);
    }
    const data = await response.json();
    return data.response;
  }

  async getGroup(groupId: string): Promise<GroupMeGroup> {
    const response = await fetch(`${this.baseUrl}/groups/${groupId}?token=${this.accessToken}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch group: ${response.statusText}`);
    }
    const data = await response.json();
    return data.response;
  }

  async getBots(): Promise<GroupMeBot[]> {
    const response = await fetch(`${this.baseUrl}/bots?token=${this.accessToken}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch bots: ${response.statusText}`);
    }
    const data = await response.json();
    return data.response;
  }

  async createBot(groupId: string, name: string, callbackUrl: string, avatarUrl?: string): Promise<GroupMeBot> {
    const botData = {
      bot: {
        name,
        group_id: groupId,
        callback_url: callbackUrl,
        ...(avatarUrl && { avatar_url: avatarUrl })
      }
    };

    const response = await fetch(`${this.baseUrl}/bots?token=${this.accessToken}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(botData)
    });

    if (!response.ok) {
      throw new Error(`Failed to create bot: ${response.statusText}`);
    }

    const data = await response.json();
    return data.response.bot;
  }

  async sendMessage(botId: string, text: string): Promise<void> {
    const messageData = {
      bot_id: botId,
      text
    };

    const response = await fetch(`${this.baseUrl}/bots/post`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messageData)
    });

    if (!response.ok) {
      throw new Error(`Failed to send message: ${response.statusText}`);
    }
  }
}

// Utility function to validate GroupMe webhook
export function validateGroupMeWebhook(body: any): boolean {
  return (
    body &&
    typeof body.group_id === 'string' &&
    typeof body.text === 'string' &&
    typeof body.name === 'string'
  );
}