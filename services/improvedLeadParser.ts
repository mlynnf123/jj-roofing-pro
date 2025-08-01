import { Lead } from '../types';

interface ParsedLeadData {
  firstName?: string;
  lastName?: string;
  address?: string;
  phoneNumber?: string;
  claimNumber?: string;
  claimCompany?: string;
  nextSetDate?: string;
  claimInfo?: string;
}

// Common insurance companies to help identify claim companies
const INSURANCE_COMPANIES = [
  'State Farm', 'USAA', 'Liberty Mutual', 'Farmers', 'Nationwide', 'Progressive',
  'Allstate', 'Geico', 'Travelers', 'American Family', 'Auto-Owners', 'Erie',
  'Chubb', 'Amica', 'Mercury', 'The Hartford', 'Safeco', 'MetLife', 'AAA',
  'Encompass', 'Esurance', 'The General', 'Root', 'Lemonade', 'Hippo'
];

// Sales rep indicators
const SALES_REP_INDICATORS = [
  '@', 'Let\'s', 'We\'re', 'I\'m', 'Team', 'Added', 'Removed', 'Good morning', 
  'Today', 'Tomorrow', 'This week', 'Next week', 'Everyone', 'All', 'Who\'s'
];

// Non-customer name indicators (these shouldn't be customer names)
const NON_CUSTOMER_NAME_INDICATORS = [
  'Lead', 'Bot', 'Chat', 'Team', 'Group', 'Sales', 'Park', 'Creek', 'Contract',
  'Let', 'Added', 'Removed', 'Morning', 'Today', 'Tomorrow', 'Week', 'Call'
];

export function parseLeadFromMessage(text: string, senderName: string): ParsedLeadData | null {
  if (!text || !text.trim()) return null;

  console.log("Parsing message:", text);
  console.log("Sender:", senderName);

  // Skip sales rep messages/announcements
  if (SALES_REP_INDICATORS.some(indicator => 
    text.toLowerCase().includes(indicator.toLowerCase())
  )) {
    console.log("Skipping sales rep message");
    return null;
  }

  const result: ParsedLeadData = {};

  // Extract phone numbers (various formats)
  const phonePatterns = [
    /(?:\+1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g,
    /([0-9]{3})[-.]([0-9]{3})[-.]([0-9]{4})/g,
    /\(([0-9]{3})\)\s*([0-9]{3})[-.]([0-9]{4})/g
  ];
  
  for (const pattern of phonePatterns) {
    const phoneMatch = text.match(pattern);
    if (phoneMatch) {
      result.phoneNumber = phoneMatch[0].trim();
      break;
    }
  }

  // Extract claim numbers (various formats)
  const claimPatterns = [
    /claim\s*#?\s*:?\s*([A-Z0-9\-_]{6,})/gi,
    /claim\s*number\s*:?\s*([A-Z0-9\-_]{6,})/gi,
    /#\s*([A-Z0-9\-_]{6,})/g
  ];
  
  for (const pattern of claimPatterns) {
    const claimMatch = text.match(pattern);
    if (claimMatch) {
      result.claimNumber = claimMatch[1];
      break;
    }
  }

  // Extract insurance companies
  for (const company of INSURANCE_COMPANIES) {
    if (text.toLowerCase().includes(company.toLowerCase())) {
      result.claimCompany = company;
      break;
    }
  }

  // Extract addresses (look for numbers followed by street indicators)
  const addressPatterns = [
    /\b(\d+\s+[A-Za-z\s]+(Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Court|Ct|Place|Pl|Way|Boulevard|Blvd)\b[^,\n]*)/gi,
    /\b(\d+\s+[A-Za-z\s]+(?:St|Ave|Rd|Dr|Ln|Ct|Pl|Way|Blvd)\b)/gi
  ];

  for (const pattern of addressPatterns) {
    const addressMatch = text.match(pattern);
    if (addressMatch) {
      let address = addressMatch[1].trim();
      // Clean up common parsing issues
      address = address.replace(/\s+/g, ' ');
      if (address.length > 10 && address.length < 100) { // Reasonable address length
        result.address = address;
        break;
      }
    }
  }

  // Extract dates mentioned by sales rep (not message timestamp)
  const datePatterns = [
    /(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)\s+(?:morning|afternoon|evening)?/gi,
    /(?:today|tomorrow|this\s+week|next\s+week|this\s+monday|next\s+friday)/gi,
    /\b\d{1,2}\/\d{1,2}(?:\/\d{2,4})?\b/g,
    /\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{1,2}/gi
  ];

  for (const pattern of datePatterns) {
    const dateMatch = text.match(pattern);
    if (dateMatch) {
      result.nextSetDate = dateMatch[0].trim();
      break;
    }
  }

  // Extract customer names (more intelligent approach)
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  for (const line of lines) {
    // Skip lines that contain sales rep indicators
    if (SALES_REP_INDICATORS.some(indicator => 
      line.toLowerCase().includes(indicator.toLowerCase())
    )) {
      continue;
    }

    // Look for name patterns (First Last)
    const namePattern = /^([A-Z][a-z]+)\s+([A-Z][a-z]+)(?:\s|$)/;
    const nameMatch = line.match(namePattern);
    
    if (nameMatch) {
      const firstName = nameMatch[1];
      const lastName = nameMatch[2];
      
      // Check if this looks like a real customer name
      if (!NON_CUSTOMER_NAME_INDICATORS.some(indicator => 
        firstName.includes(indicator) || lastName.includes(indicator)
      )) {
        result.firstName = firstName;
        result.lastName = lastName;
        break;
      }
    }
  }

  // If no proper name found, try single name extraction (but be more careful)
  if (!result.firstName && !result.lastName) {
    const singleNamePattern = /\b([A-Z][a-z]{2,})\b/g;
    const matches = text.match(singleNamePattern);
    
    if (matches) {
      for (const match of matches) {
        if (!NON_CUSTOMER_NAME_INDICATORS.some(indicator => 
          match.toLowerCase().includes(indicator.toLowerCase())
        ) && 
        !INSURANCE_COMPANIES.some(company => 
          match.toLowerCase().includes(company.toLowerCase())
        )) {
          result.firstName = match;
          result.lastName = "Unspecified";
          break;
        }
      }
    }
  }

  // Extract claim info (damage descriptions, etc.)
  const claimInfoPatterns = [
    /(?:damage|storm|hail|wind|leak|roof|gutter|siding)[^.\n]*/gi,
    /(?:filing|claim|inspect|inspection)[^.\n]*/gi
  ];

  for (const pattern of claimInfoPatterns) {
    const claimInfoMatch = text.match(pattern);
    if (claimInfoMatch) {
      result.claimInfo = claimInfoMatch.join(', ');
      break;
    }
  }

  // Must have at least a name to be considered a valid lead
  if (!result.firstName && !result.lastName) {
    console.log("No valid customer name found, skipping");
    return null;
  }

  console.log("Parsed result:", result);
  return result;
}

// Enhanced Gemini parsing with better prompts
export async function parseLeadInfoWithGemini(rawText: string): Promise<Partial<Lead>> {
  console.log("Starting enhanced Gemini parsing for:", rawText);
  
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API key is not configured. Set API_KEY environment variable.");
  }

  const prompt = `You are parsing roofing sales lead information from GroupMe messages. Extract ONLY the customer information, not sales rep information.

RULES:
1. Customer names should be actual people's names (First Last), not places, companies, or sales terminology
2. If no clear customer name exists, return null for firstName/lastName
3. Address should be a street address, not city names or "Address not specified"
4. Phone numbers should be customer phone numbers, not sales rep numbers
5. Only extract claim numbers that are clearly insurance claim numbers (6+ characters)
6. Only extract dates that sales reps mention for appointments/follow-ups (not message timestamp)

Message: "${rawText}"

Extract these fields (return "unspecified" if not found, null if invalid):
- firstName: Customer's first name (must be a person's name)
- lastName: Customer's last name (must be a person's name)
- address: Property street address (full street address only)
- phoneNumber: Customer phone number
- claimNumber: Insurance claim number (format like ABC123456)
- claimCompany: Insurance company name (State Farm, USAA, Travelers, etc.)
- nextSetDate: Any date/time mentioned by sales rep for follow-up
- claimInfo: Damage description or claim details

Return only valid JSON, no explanations:`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 500,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API request failed: ${response.status}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!content) {
      throw new Error("No content in Gemini response");
    }

    console.log("Gemini raw response:", content);

    // Clean and parse JSON
    const cleanedContent = content.replace(/```json|```/g, '').trim();
    const parsedData = JSON.parse(cleanedContent) as Partial<Lead>;
    
    // Clean up "unspecified" values
    Object.keys(parsedData).forEach(key => {
      if (parsedData[key as keyof Lead] === "unspecified" || parsedData[key as keyof Lead] === "null") {
        delete parsedData[key as keyof Lead];
      }
    });

    console.log("Parsed lead data:", parsedData);
    return parsedData;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    // Fallback to manual parsing
    return parseLeadFromMessage(rawText, "Unknown") || {};
  }
}