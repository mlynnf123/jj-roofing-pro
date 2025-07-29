
import { NextResponse } from 'next/server';
import { parseLeadInfoWithGemini } from '@/services/geminiService';

export async function POST(request: Request) {
    try {
        const { text } = await request.json();
        if (!text) {
            return NextResponse.json({ message: "Text to parse is required." }, { status: 400 });
        }

        const parsedData = await parseLeadInfoWithGemini(text);

        return NextResponse.json(parsedData);

    } catch (error) {
        console.error("Error in /api/parse-lead:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return NextResponse.json({ message: "Failed to parse lead with AI", error: errorMessage }, { status: 500 });
    }
}
