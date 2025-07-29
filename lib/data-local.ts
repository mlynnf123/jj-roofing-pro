import { Lead } from '../types';
import fs from 'fs/promises';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'leads.json');

// Ensure data directory exists
async function ensureDataDir() {
    const dataDir = path.dirname(DATA_FILE);
    try {
        await fs.mkdir(dataDir, { recursive: true });
    } catch (error) {
        // Directory may already exist
    }
}

// Load leads from local JSON file
export const getLeadsLocal = async (): Promise<Lead[]> => {
    try {
        await ensureDataDir();
        const data = await fs.readFile(DATA_FILE, 'utf-8');
        const leads = JSON.parse(data) as Lead[];
        // Sort by timestamp descending (newest first)
        return leads.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch (error) {
        // File doesn't exist or is invalid, return empty array
        return [];
    }
};

// Add a new lead to local JSON file
export const addLeadLocal = async (lead: Lead): Promise<Lead> => {
    try {
        await ensureDataDir();
        const leads = await getLeadsLocal();
        leads.unshift(lead); // Add to beginning of array
        await fs.writeFile(DATA_FILE, JSON.stringify(leads, null, 2));
        return lead;
    } catch (error) {
        console.error("Error adding lead locally:", error);
        throw error;
    }
};

// Update an existing lead in local JSON file
export const updateLeadLocal = async (updatedLead: Lead): Promise<Lead> => {
    try {
        await ensureDataDir();
        const leads = await getLeadsLocal();
        const index = leads.findIndex(lead => lead.id === updatedLead.id);
        
        if (index === -1) {
            throw new Error("Lead not found");
        }
        
        leads[index] = updatedLead;
        await fs.writeFile(DATA_FILE, JSON.stringify(leads, null, 2));
        return updatedLead;
    } catch (error) {
        console.error("Error updating lead locally:", error);
        throw error;
    }
};

// Delete a lead from local JSON file
export const deleteLeadLocal = async (leadId: string): Promise<boolean> => {
    try {
        await ensureDataDir();
        const leads = await getLeadsLocal();
        const index = leads.findIndex(lead => lead.id === leadId);
        
        if (index === -1) {
            return false;
        }
        
        leads.splice(index, 1);
        await fs.writeFile(DATA_FILE, JSON.stringify(leads, null, 2));
        return true;
    } catch (error) {
        console.error("Error deleting lead locally:", error);
        throw error;
    }
};