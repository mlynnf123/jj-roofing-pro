import { NextResponse } from 'next/server';
import { parseLeadInfoWithGemini } from '@/services/improvedLeadParser';
import { saveLeadToDatabase } from '@/lib/firebaseUtils';
import { checkForDuplicateLead } from '@/lib/data';
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

// Async function to process lead without blocking webhook response
async function processLeadAsync(text: string, senderName: string): Promise<void> {
    try {
        console.log(`Processing lead from ${senderName}: "${text}"`);

        // Use Gemini to parse the lead information with timeout and fallback
        let parsedData: Partial<Lead>;
        
        try {
            // Add timeout to AI parsing
            const parseWithTimeout = Promise.race([
                parseLeadInfoWithGemini(text),
                new Promise<never>((_, reject) => 
                    setTimeout(() => reject(new Error("AI parsing timeout")), 3000)
                )
            ]);
            
            parsedData = await parseWithTimeout;
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
            console.log("Could not parse customer name from message. Skipping lead creation.");
            return;
        }

        // Check for duplicate leads with timeout
        let duplicateLead;
        try {
            const duplicateCheckWithTimeout = Promise.race([
                checkForDuplicateLead(
                    parsedData.firstName,
                    parsedData.lastName,
                    parsedData.address || "Address not specified"
                ),
                new Promise<null>((resolve) => 
                    setTimeout(() => resolve(null), 2000)
                )
            ]);
            
            duplicateLead = await duplicateCheckWithTimeout;
        } catch (error) {
            console.error("Duplicate check failed, proceeding with lead creation:", error);
            duplicateLead = null;
        }

        if (duplicateLead) {
            console.log(`Duplicate lead detected for ${parsedData.firstName} ${parsedData.lastName} at ${parsedData.address}. Skipping.`);
            return;
        }
        
        const now = new Date().toISOString();

        const newLead: Lead = {
            id: crypto.randomUUID(),
            timestamp: now,
            stage: LeadStage.NEW_LEAD,
            lastStageUpdateTimestamp: now,
            sender: senderName,
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
        
        // Save lead to database with improved error handling
        try {
            await saveLeadToDatabase(newLead);
            console.log("Successfully processed and saved new lead:", newLead.id);
        } catch (error) {
            console.error("Failed to save lead to database:", error);
            // TODO: Implement retry queue for failed saves
        }

    } catch (error) {
        console.error("Error in async lead processing:", error);
    }
}

export async function POST(request: Request) {
    try {
        const body: GroupMeWebhookPayload = await request.json();
        const { text, name: senderName } = body;

        // Respond to GroupMe immediately to prevent timeouts
        const response = NextResponse.json({ message: "Message received" }, { status: 200 });

        if (!text) {
            console.log("Ignoring message without text");
            return response;
        }
        
        // Avoid bot loops
        if (senderName === 'RoofingBot' || senderName === 'AI Lead Parser') {
            console.log("Ignoring bot message");
            return response;
        }

        // Process lead asynchronously without blocking response
        processLeadAsync(text, senderName).catch(error => {
            console.error("Async lead processing failed:", error);
        });

        return response;

    } catch (error) {
        console.error("Error processing GroupMe webhook:", error);
        // Still return 200 to prevent GroupMe from retrying
        return NextResponse.json({ message: "Webhook received" }, { status: 200 });
    }
}