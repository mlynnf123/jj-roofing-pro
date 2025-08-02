import { collection, getDocs, doc, setDoc, deleteDoc, query, orderBy, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db } from './firebase';
import { Lead } from '../types';

const LEADS_COLLECTION = 'jj-pros';

// Fetches all leads from Firestore, ordered by most recent.
export const getLeads = async (): Promise<Lead[]> => {
    const leadsCollectionRef = collection(db, LEADS_COLLECTION);
    // Order by timestamp in descending order to get newest leads first
    const q = query(leadsCollectionRef, orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);
    // The document data should already contain the full Lead object, including the ID.
    const leadsList = querySnapshot.docs.map(doc => doc.data() as Lead);
    return leadsList;
};

// Adds a new lead document to Firestore using the provided lead object (which includes a client-generated ID).
export const addLead = async (lead: Lead): Promise<Lead> => {
    try {
        console.log("Starting Firebase write for lead:", lead.id);
        console.log("Firebase database instance:", !!db);
        console.log("Lead data to save:", JSON.stringify(lead, null, 2));
        
        // Create a document reference with the specific ID from the lead object.
        const leadDocRef = doc(db, LEADS_COLLECTION, lead.id);
        console.log("Document reference created for collection:", LEADS_COLLECTION);
        
        console.log("Attempting setDoc operation...");
        
        // setDoc will create the document with this ID.
        await setDoc(leadDocRef, lead);
        
        console.log("Successfully wrote lead to Firestore:", lead.id);
        
        // Verify the write by reading it back
        try {
            const verifyQuery = query(collection(db, LEADS_COLLECTION), orderBy('timestamp', 'desc'));
            const verifySnapshot = await getDocs(verifyQuery);
            console.log(`Verification: ${verifySnapshot.size} documents now in collection`);
        } catch (verifyError) {
            console.warn("Could not verify write:", verifyError);
        }
        
        return lead; // Return the original lead object.
    } catch (error) {
        console.error("Error adding lead to Firestore:", error);
        console.error("Error details:", {
            message: error instanceof Error ? error.message : "Unknown error",
            code: (error as any)?.code,
            stack: error instanceof Error ? error.stack : undefined,
            leadId: lead.id,
            collection: LEADS_COLLECTION
        });
        throw error;
    }
};

// Updates an existing lead document in Firestore.
export const updateLead = async (updatedLead: Lead): Promise<Lead> => {
    // Create a document reference with the specific ID from the lead object.
    const leadDocRef = doc(db, LEADS_COLLECTION, updatedLead.id);
    // setDoc will overwrite the existing document with the new data.
    await setDoc(leadDocRef, updatedLead);
    return updatedLead;
};

// Deletes a lead document from Firestore.
export const deleteLead = async (leadId: string): Promise<boolean> => {
    try {
        // Create a document reference with the specific ID.
        const leadDocRef = doc(db, LEADS_COLLECTION, leadId);
        // Delete the document.
        await deleteDoc(leadDocRef);
        return true;
    } catch (error) {
        console.error("Error deleting lead from Firestore:", error);
        throw error;
    }
};

// Checks for duplicate leads based on customer name and address
export const checkForDuplicateLead = async (firstName: string, lastName: string, address: string): Promise<Lead | null> => {
    try {
        const leads = await getLeads();
        
        // Normalize strings for comparison
        const normalizeString = (str: string) => str.toLowerCase().trim().replace(/\s+/g, ' ');
        
        const targetFirstName = normalizeString(firstName);
        const targetLastName = normalizeString(lastName);
        const targetAddress = normalizeString(address);
        
        // Look for existing lead with same customer name and address
        const duplicateLead = leads.find(lead => {
            const leadFirstName = normalizeString(lead.firstName);
            const leadLastName = normalizeString(lead.lastName);
            const leadAddress = normalizeString(lead.address);
            
            return leadFirstName === targetFirstName && 
                   leadLastName === targetLastName && 
                   leadAddress === targetAddress;
        });
        
        return duplicateLead || null;
    } catch (error) {
        console.error("Error checking for duplicate lead:", error);
        return null; // Return null if check fails, allowing lead creation to proceed
    }
};

// Sets up a real-time listener for leads collection
export const subscribeToLeads = (callback: (leads: Lead[]) => void): Unsubscribe => {
    try {
        const leadsCollectionRef = collection(db, LEADS_COLLECTION);
        const q = query(leadsCollectionRef, orderBy('timestamp', 'desc'));
        
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const leadsList = querySnapshot.docs.map(doc => doc.data() as Lead);
            callback(leadsList);
        }, (error) => {
            console.error("Error in leads subscription:", error);
            // Fallback to one-time fetch if real-time fails
            getLeads().then(callback).catch(console.error);
        });
        
        return unsubscribe;
    } catch (error) {
        console.error("Error setting up leads subscription:", error);
        // Fallback to one-time fetch
        getLeads().then(callback).catch(console.error);
        return () => {}; // Return empty unsubscribe function
    }
};
