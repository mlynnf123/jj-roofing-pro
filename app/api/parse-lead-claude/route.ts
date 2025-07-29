import { NextResponse } from 'next/server';
import { parseLeadInfoWithClaude } from '@/services/claudeService';

export async function POST(request: Request) {
    try {
        const { text } = await request.json();
        if (!text) {
            return NextResponse.json({ message: "Text to parse is required." }, { status: 400 });
        }

        const parsedData = await parseLeadInfoWithClaude(text);

        return NextResponse.json(parsedData);

    } catch (error) {
        console.error("Error in /api/parse-lead-claude:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return NextResponse.json({ 
            message: "Failed to parse lead with Claude", 
            error: errorMessage 
        }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({
        message: "Claude lead parsing endpoint",
        usage: "POST with {\"text\": \"your message here\"}",
        model: "claude-3-5-haiku-20241022"
    });
}