import { NextResponse } from 'next/server';
import { parseLeadInfoWithGemini } from '@/services/improvedLeadParser';
import { saveLeadToDatabase } from '@/lib/firebaseUtils';
import { Lead, LeadStage } from '@/types';

interface GroupMeWebhookPayload {
    text: string;
    name: string; // This is the sender's name
    // ... other fields exist but we only need these two
}

// Simple text parsing fallback functions
function extractFirstName(text: string): string | undefined {
    // Look for patterns like "John Smith", "First: John", etc.
    const patterns = [
        /(?:^|[\s,])((?:[A-Z][a-z]+))\s+(?:[A-Z][a-z]+)/,  // "John Smith"
        /(?:first|name):\s*([A-Z][a-z]+)/i,                 // "First: John"
        /([A-Z][a-z]+)\s+(?:at|@)/,                         // "John at 123"
    ];
    
    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match && match[1]) return match[1];
    }
    return undefined;
}

function extractLastName(text: string): string | undefined {
    // Look for patterns like "John Smith", "Last: Smith", etc.
    const patterns = [
        /(?:^|[\s,])(?:[A-Z][a-z]+)\s+([A-Z][a-z]+)/,      // "John Smith"
        /(?:last|surname):\s*([A-Z][a-z]+)/i,              // "Last: Smith"
    ];
    
    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match && match[1]) return match[1];
    }
    return undefined;
}

function extractAddress(text: string): string | undefined {
    // Look for address patterns
    const patterns = [
        /(?:at|@)\s+([0-9]+[^,.]*(?:st|street|ave|avenue|rd|road|dr|drive|blvd|boulevard|ln|lane|ct|court|pl|place|way)[^,.]*)(?:\s|$|,|\.)/i,
        /(?:address|addr):\s*([^,.]+)/i,
        /([0-9]+\s+[A-Za-z\s]+(?:st|street|ave|avenue|rd|road|dr|drive|blvd|boulevard|ln|lane|ct|court|pl|place|way))/i,
    ];
    
    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match && match[1]) return match[1].trim();
    }
    return undefined;
}

export async function POST(request: Request) {
    try {
        const body: GroupMeWebhookPayload = await request.json();
        const { text, name: senderName } = body;

        if (!text) {
            // Ignore messages without text (e.g., likes)
            return NextResponse.json({ message: "OK - No text" }, { status: 200 });
        }
        
        // Avoid bot loops - you should name your bot something unique.
        if (senderName === 'RoofingBot' || senderName === 'AI Lead Parser') {
            return NextResponse.json({ message: "Ignoring bot message." }, { status: 200 });
        }

        console.log(`Received message from ${senderName}: "${text}"`);

        // Use Gemini to parse the lead information with fallback
        let parsedData: Partial<Lead>;
        
        try {
            parsedData = await parseLeadInfoWithGemini(text);
        } catch (error) {
            console.error("Gemini parsing failed, using manual parsing:", error);
            // Fallback to simple text parsing
            parsedData = {
                firstName: extractFirstName(text),
                lastName: extractLastName(text),
                address: extractAddress(text),
                originalMessage: text
            };
        }

        if (!parsedData.firstName || !parsedData.lastName) {
            console.log("Could not parse customer name from message. Ignoring.");
            // Still return 200 so GroupMe doesn't retry.
            return NextResponse.json({ message: "OK - Could not parse customer name" }, { status: 200 });
        }
        
        const now = new Date().toISOString();

        const newLead: Lead = {
            id: crypto.randomUUID(),
            timestamp: now,
            stage: LeadStage.NEW_LEAD,
            lastStageUpdateTimestamp: now,
            sender: senderName, // Set sender from GroupMe message
            originalMessage: text,
            documents: [],
            firstName: parsedData.firstName!,
            lastName: parsedData.lastName!,
            address: parsedData.address || "Address not specified",
            phoneNumber: parsedData.phoneNumber || "Phone not specified",
            claimNumber: parsedData.claimNumber || "Claim number not specified",
            claimCompany: parsedData.claimCompany || "Insurance company not specified",
            nextSetDate: parsedData.nextSetDate,
            ...(parsedData.time && { time: parsedData.time }),
            ...(parsedData.claimInfo && { claimInfo: parsedData.claimInfo }),
        };
        
        // Save lead to database (Firebase in production, local storage fallback in development)
        await saveLeadToDatabase(newLead);
        
        console.log("Successfully parsed and added new lead:", newLead);

        return NextResponse.json({ message: "Lead processed successfully" }, { status: 200 });

    } catch (error) {
        console.error("Error processing GroupMe webhook:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return NextResponse.json({ message: "Error processing webhook", error: errorMessage }, { status: 500 });
    }
}