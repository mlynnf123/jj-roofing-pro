import { addLead as addLeadFirestore } from './data';
import { addLeadLocal } from './data-local';
import { Lead } from '../types';

// Enhanced Firebase operation with proper fallback handling
export const saveLeadToDatabase = async (lead: Lead): Promise<Lead> => {
    const isDevelopment = process.env.NODE_ENV === 'development';
    const isLocal = process.env.VERCEL_ENV !== 'production' && process.env.NODE_ENV !== 'production';
    
    console.log(`Saving lead in ${isDevelopment ? 'development' : 'production'} environment`);
    
    try {
        // Try Firebase first
        const saveWithTimeout = Promise.race([
            addLeadFirestore(lead),
            new Promise<never>((_, reject) => 
                setTimeout(() => reject(new Error("Firebase timeout")), 10000)
            )
        ]);
        
        const result = await saveWithTimeout;
        console.log("Lead saved to Firebase successfully");
        return result;
        
    } catch (firebaseError) {
        console.error("Firebase save failed:", firebaseError);
        
        // In development/local, fallback to local storage for testing
        if (isDevelopment || isLocal) {
            console.log("Development environment detected, using local storage fallback");
            const result = await addLeadLocal(lead);
            console.log("Lead saved to local storage successfully");
            return result;
        } else {
            // In production, Firebase failure is a real error
            console.error("Production Firebase failure - no fallback available");
            throw firebaseError;
        }
    }
};