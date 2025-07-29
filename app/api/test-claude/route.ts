import { NextResponse } from 'next/server';
import { parseLeadInfoWithClaudeSimple } from '@/services/claudeServiceSimple';

export async function POST(request: Request) {
    try {
        const { text } = await request.json();
        if (!text) {
            return NextResponse.json({ message: "Text to parse is required." }, { status: 400 });
        }

        console.log("Testing Claude simple integration with:", text);
        const parsedData = await parseLeadInfoWithClaudeSimple(text);

        return NextResponse.json({
            success: true,
            data: parsedData,
            message: "Claude parsing successful"
        });

    } catch (error) {
        console.error("Error in /api/test-claude:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return NextResponse.json({ 
            success: false,
            message: "Claude parsing failed", 
            error: errorMessage 
        }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({
        message: "Claude test endpoint (simple implementation)",
        usage: "POST with {\"text\": \"your message here\"}",
        status: "ready"
    });
}