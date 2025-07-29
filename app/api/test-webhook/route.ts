import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { text, name } = body;

        console.log(`Test webhook received from ${name}: "${text}"`);

        // Simple response without Firebase
        return NextResponse.json({ 
            message: "Test webhook received successfully",
            parsed: {
                text,
                sender: name,
                timestamp: new Date().toISOString()
            }
        }, { status: 200 });

    } catch (error) {
        console.error("Error in test webhook:", error);
        return NextResponse.json({ 
            message: "Error processing test webhook", 
            error: error instanceof Error ? error.message : "Unknown error" 
        }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({ 
        message: "Test webhook endpoint is working",
        timestamp: new Date().toISOString()
    });
}