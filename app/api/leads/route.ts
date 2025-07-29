import { NextResponse } from 'next/server';
import { getLeads, addLead, updateLead, deleteLead } from '@/lib/data';
import { getLeadsLocal, addLeadLocal, updateLeadLocal, deleteLeadLocal } from '@/lib/data-local';
import { Lead } from '@/types';

// Use Firebase for persistence in production (Cloud Run)
// Local storage only works in development due to ephemeral file system
const USE_LOCAL_STORAGE = false;

export async function GET() {
    try {
        const leads = USE_LOCAL_STORAGE ? await getLeadsLocal() : await getLeads();
        return NextResponse.json(leads);
    } catch (error) {
        return NextResponse.json({ message: "Failed to fetch leads", error }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const newLeadData = await request.json() as Lead;
        const newLead = USE_LOCAL_STORAGE ? await addLeadLocal(newLeadData) : await addLead(newLeadData);
        return NextResponse.json(newLead, { status: 201 });
    } catch (error) {
        console.error("Failed to add lead:", error);
        return NextResponse.json({ 
            message: "Failed to add lead", 
            error: error instanceof Error ? error.message : String(error) 
        }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const updatedLeadData = await request.json() as Lead;
        const updatedLead = USE_LOCAL_STORAGE ? await updateLeadLocal(updatedLeadData) : await updateLead(updatedLeadData);
        if (!updatedLead) {
            return NextResponse.json({ message: "Lead not found" }, { status: 404 });
        }
        return NextResponse.json(updatedLead, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Failed to update lead", error }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        
        if (!id) {
            return NextResponse.json({ message: "Lead ID is required" }, { status: 400 });
        }
        
        const success = USE_LOCAL_STORAGE ? await deleteLeadLocal(id) : await deleteLead(id);
        if (!success) {
            return NextResponse.json({ message: "Lead not found" }, { status: 404 });
        }
        
        return NextResponse.json({ message: "Lead deleted successfully" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Failed to delete lead", error }, { status: 500 });
    }
}