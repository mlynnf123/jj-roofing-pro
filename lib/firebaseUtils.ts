import { addLead as addLeadFirestore } from './data';
import { Lead } from '../types';

// Enhanced Firebase operation with proper fallback handling
export const saveLeadToDatabase = async (lead: Lead): Promise<Lead> => {
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    console.log(`Saving lead in ${isDevelopment ? 'development' : 'production'} environment`);
    
    try {
        // Try Firebase with shorter timeout for better responsiveness
        const saveWithTimeout = Promise.race([
            addLeadFirestore(lead),
            new Promise<never>((_, reject) => 
                setTimeout(() => reject(new Error("Firebase timeout")), 5000)
            )
        ]);
        
        const result = await saveWithTimeout;
        console.log("Lead saved to Firebase successfully");
        return result;
        
    } catch (firebaseError) {
        console.error("Firebase save failed:", firebaseError);
        
        // For webhooks, we want to respond quickly even if Firebase fails
        // Log the error and return the lead data to prevent webhook failures
        console.log("Firebase failed, but returning lead data to prevent webhook timeout");
        
        // Attempt a retry with a very short timeout
        try {
            const retryPromise = Promise.race([
                addLeadFirestore(lead),
                new Promise<never>((_, reject) => 
                    setTimeout(() => reject(new Error("Firebase retry timeout")), 2000)
                )
            ]);
            
            const retryResult = await retryPromise;
            console.log("Lead saved to Firebase on retry");
            return retryResult;
            
        } catch (retryError) {
            console.error("Firebase retry also failed:", retryError);
            
            // For webhooks in production, we still return the lead to avoid breaking the webhook
            // The lead data should still be processed even if storage fails temporarily
            return lead;
        }
    }
};