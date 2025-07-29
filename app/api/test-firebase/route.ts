import { NextResponse } from 'next/server';
import { addLead } from '@/lib/data';
import { Lead, LeadStage } from '@/types';

export async function POST(request: Request) {
    try {
        const now = new Date().toISOString();
        
        const testLead: Lead = {
            id: `test-${Date.now()}`,
            timestamp: now,
            stage: LeadStage.NEW_LEAD,
            lastStageUpdateTimestamp: now,
            sender: "Test",
            originalMessage: "Test lead from API",
            documents: [],
            firstName: "Test",
            lastName: "User",
            address: "123 Test Street"
        };

        console.log("Attempting to save test lead:", testLead);
        
        // Add timeout to the Firebase operation
        const saveWithTimeout = Promise.race([
            addLead(testLead),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error("Firebase timeout")), 5000)
            )
        ]);

        const result = await saveWithTimeout;
        console.log("Test lead saved successfully:", result);

        return NextResponse.json({ 
            success: true, 
            message: "Test lead saved successfully",
            lead: testLead
        });

    } catch (error) {
        console.error("Error saving test lead:", error);
        return NextResponse.json({ 
            success: false,
            message: "Failed to save test lead", 
            error: error instanceof Error ? error.message : "Unknown error" 
        }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({
        message: "Firebase write test endpoint",
        usage: "POST to test Firebase write operation"
    });
}