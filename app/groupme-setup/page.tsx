'use client';

import { useState, useEffect } from 'react';

interface Bot {
  bot_id: string;
  name: string;
  group_id: string;
  callback_url: string;
}

interface Group {
  id: string;
  name: string;
  description: string;
  memberCount: number;
}

export default function GroupMeSetupPage() {
  const [accessToken, setAccessToken] = useState('');
  const [groups, setGroups] = useState<Group[]>([]);
  const [bots, setBots] = useState<Bot[]>([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [botName, setBotName] = useState('JJ Roofing Bot');
  const [loading, setLoading] = useState(false);
  const [diagnostics, setDiagnostics] = useState<any>(null);

  useEffect(() => {
    // Check for token in environment
    const envToken = process.env.NEXT_PUBLIC_GROUPME_ACCESS_TOKEN;
    if (envToken) {
      setAccessToken(envToken);
    }
  }, []);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/groupme-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken, action: 'list-groups' })
      });
      const data = await response.json();
      if (data.groups) {
        setGroups(data.groups);
      } else {
        alert('Failed to fetch groups: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      alert('Error fetching groups: ' + error);
    }
    setLoading(false);
  };

  const fetchBots = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/groupme-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken, action: 'list-bots' })
      });
      const data = await response.json();
      if (data.bots) {
        setBots(data.bots);
      }
    } catch (error) {
      console.error('Error fetching bots:', error);
    }
    setLoading(false);
  };

  const createBot = async () => {
    if (!selectedGroup || !botName) {
      alert('Please select a group and enter a bot name');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/groupme-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessToken,
          action: 'create-bot',
          groupId: selectedGroup,
          botName
        })
      });
      const data = await response.json();
      if (data.success) {
        alert(`Bot created successfully! Webhook URL: ${data.webhookUrl}`);
        fetchBots();
      } else {
        alert('Failed to create bot: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      alert('Error creating bot: ' + error);
    }
    setLoading(false);
  };

  const runDiagnostics = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/groupme-diagnostic');
      const data = await response.json();
      setDiagnostics(data);
    } catch (error) {
      console.error('Diagnostics error:', error);
    }
    setLoading(false);
  };

  const testWebhook = async () => {
    try {
      const response = await fetch('/api/groupme-webhook-test');
      const data = await response.json();
      alert(`Recent webhooks: ${data.totalReceived}\n\nCheck console for details.`);
    } catch (error) {
      alert('Error checking webhooks: ' + error);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">GroupMe Bot Setup</h1>

      {/* Step 1: Access Token */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Step 1: GroupMe Access Token</h2>
        <p className="text-gray-600 mb-4">
          Get your access token from{' '}
          <a href="https://dev.groupme.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
            https://dev.groupme.com/
          </a>
        </p>
        <input
          type="password"
          placeholder="Enter GroupMe Access Token"
          value={accessToken}
          onChange={(e) => setAccessToken(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        />
        <button
          onClick={() => { fetchGroups(); fetchBots(); }}
          disabled={!accessToken || loading}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
        >
          Connect to GroupMe
        </button>
      </div>

      {/* Step 2: Select Group */}
      {groups.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Step 2: Select Group</h2>
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="w-full p-2 border rounded mb-4"
          >
            <option value="">Select a group...</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name} ({group.memberCount} members)
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Step 3: Create Bot */}
      {selectedGroup && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Step 3: Create Bot</h2>
          <input
            type="text"
            placeholder="Bot Name"
            value={botName}
            onChange={(e) => setBotName(e.target.value)}
            className="w-full p-2 border rounded mb-4"
          />
          <button
            onClick={createBot}
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
          >
            Create Bot
          </button>
        </div>
      )}

      {/* Existing Bots */}
      {bots.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Existing Bots</h2>
          <div className="space-y-2">
            {bots.map((bot) => (
              <div key={bot.bot_id} className="border p-3 rounded">
                <p className="font-semibold">{bot.name}</p>
                <p className="text-sm text-gray-600">Group ID: {bot.group_id}</p>
                <p className="text-sm text-gray-600">
                  Webhook: {bot.callback_url || 'Not configured'}
                </p>
                {bot.callback_url && bot.callback_url.includes('groupme-webhook') && (
                  <span className="text-green-600 text-sm">✓ Configured for this app</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Diagnostics */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Diagnostics</h2>
        <div className="space-x-2">
          <button
            onClick={runDiagnostics}
            className="bg-purple-600 text-white px-4 py-2 rounded"
          >
            Run Diagnostics
          </button>
          <button
            onClick={testWebhook}
            className="bg-orange-600 text-white px-4 py-2 rounded"
          >
            Check Recent Webhooks
          </button>
        </div>
        
        {diagnostics && (
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <pre className="text-sm overflow-auto">
              {JSON.stringify(diagnostics, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="font-semibold mb-2">Important Notes:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>The webhook URL will be automatically set to your app's /api/groupme-webhook endpoint</li>
          <li>Make sure your app is deployed to a public URL (not localhost) for webhooks to work</li>
          <li>Add GROUPME_ACCESS_TOKEN to your environment variables for persistent configuration</li>
          <li>Check the browser console and server logs for webhook activity</li>
        </ul>
      </div>
    </div>
  );
}