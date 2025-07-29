import { Lead } from '../types';

// Simple Claude API integration using fetch (no SDK required)
export const parseLeadInfoWithClaudeSimple = async (rawText: string): Promise<Partial<Lead>> => {
  console.log("Starting Claude parsing (simple) for:", rawText);
  
  const key = process.env.ANTHROPIC_API_KEY;

  if (!key) {
    throw new Error("Claude API key is not configured. Set ANTHROPIC_API_KEY environment variable.");
  }

  const prompt = `Parse this message into lead information and return ONLY a JSON object with these fields (omit fields if not found):

Message: "${rawText}"

Extract:
- firstName: Customer's first name
- lastName: Customer's last name  
- address: Property address (street address only)
- time: Any mentioned appointment times or dates
- claimInfo: Insurance claim details, damage descriptions, or repair needs

Return only valid JSON, no explanations or markdown formatting.

Example: {"firstName": "John", "lastName": "Smith", "address": "123 Main St", "claimInfo": "storm damage"}`;

  try {
    console.log("Sending request to Claude API...");
    const startTime = Date.now();
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: "claude-3-5-haiku-20241022",
        max_tokens: 200,
        temperature: 0.1,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      })
    });
    
    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    const endTime = Date.now();
    console.log(`Claude response received in ${endTime - startTime}ms`);

    // Extract text content from Claude response
    if (!data.content || !data.content[0] || data.content[0].type !== 'text') {
      throw new Error("Unexpected response format from Claude");
    }
    
    const jsonStr = data.content[0].text.trim();
    console.log("Claude raw response:", jsonStr);

    // Parse JSON response
    const parsedData = JSON.parse(jsonStr) as Partial<Lead>;
    console.log("Parsed lead data:", parsedData);
    
    return parsedData;

  } catch (error) {
    console.error("Error calling Claude API:", error);
    if (error instanceof Error) {
      throw new Error(`Claude API error: ${error.message}`);
    }
    throw new Error("An unknown error occurred while communicating with Claude.");
  }
};