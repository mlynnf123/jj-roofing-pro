'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Script from 'next/script';
import { Lead, LeadStage, LeadDocument, ContractDetails, CalendarListEntry } from '../types';
import { KANBAN_STAGES } from '../constants';
import Header from '../components/Header';
import KanbanBoard from '../components/KanbanBoard';
import AddLeadModal from '../components/AddLeadModal';
import ContractModal from '../components/ContractModal';
import PrintableContract from '../components/PrintableContract';
import CalendarPage from '../components/CalendarPage';
import LeadsListPage from '../components/LeadsListPage';
import LeadManagementModal from '../components/LeadManagementModal';

const DEFAULT_COMPANY_REP = {
  name: "",
  phone: "",
  email: "",
};

type CurrentPage = 'kanban' | 'calendar' | 'leads-list';

const HomePage: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState<boolean>(false);
  const [isContractModalOpen, setIsContractModalOpen] = useState<boolean>(false);
  const [isPrintableViewOpen, setIsPrintableViewOpen] = useState<boolean>(false);
  const [isLeadManagementModalOpen, setIsLeadManagementModalOpen] = useState<boolean>(false);
  const [selectedLeadForContract, setSelectedLeadForContract] = useState<Lead | null>(null);
  const [selectedLeadForManagement, setSelectedLeadForManagement] = useState<Lead | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<CurrentPage>('leads-list');

  const isCalendarFeatureEnabled = !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  // Google Calendar API State
  const [gapiReady, setGapiReady] = useState(false);
  const [googleAuthSignedIn, setGoogleAuthSignedIn] = useState(false);
  const [calendars, setCalendars] = useState<CalendarListEntry[]>([]);
  const [googleAuthError, setGoogleAuthError] = useState<string | null>(null);

  // Data subscription with real-time updates
  const setupLeadsSubscription = useCallback(() => {
    setIsLoading(true);
    
    // Import the subscription function dynamically to avoid server-side issues
    import('../lib/data').then(({ subscribeToLeads }) => {
      const unsubscribe = subscribeToLeads((updatedLeads) => {
        setLeads(updatedLeads);
        setIsLoading(false);
      });
      
      // Return unsubscribe function for cleanup
      return unsubscribe;
    }).catch((error) => {
      console.error('Failed to setup real-time subscription, falling back to fetch:', error);
      // Fallback to API fetch if Firebase subscription fails
      fetchLeadsFallback();
    });
  }, []);

  // Fallback fetch method for when real-time subscription fails
  const fetchLeadsFallback = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/leads');
      if (!response.ok) throw new Error('Failed to fetch leads');
      const data: Lead[] = await response.json();
      setLeads(data);
    } catch (error) {
      console.error(error);
      alert('Could not load leads. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    
    // Setup real-time subscription
    import('../lib/data').then(({ subscribeToLeads }) => {
      unsubscribe = subscribeToLeads((updatedLeads) => {
        setLeads(updatedLeads);
        setIsLoading(false);
      });
    }).catch((error) => {
      console.error('Failed to setup real-time subscription:', error);
      fetchLeadsFallback();
    });
    
    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [fetchLeadsFallback]);

  // --- Google Calendar Logic ---
  const handleGapiLoad = useCallback(() => {
    window.gapi.load('client:auth2', () => {
        window.gapi.client.init({
            apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
            clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
            discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"],
            scope: "https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events",
        }).then(() => {
            setGapiReady(true);
            const authInstance = window.gapi.auth2.getAuthInstance();
            const updateStatus = (isSignedIn: boolean) => {
                setGoogleAuthSignedIn(isSignedIn);
                if (isSignedIn) {
                    fetchCalendars();
                } else {
                    setCalendars([]);
                }
            };
            authInstance.isSignedIn.listen(updateStatus);
            updateStatus(authInstance.isSignedIn.get());
        }).catch((error: any) => {
            console.error("Error initializing Google API client:", error);
            setGoogleAuthError(`Error initializing Google API: ${error.details || error.message || 'Unknown error'}`);
        });
    });
  }, []);

  const fetchCalendars = useCallback(async () => {
      if (!window.gapi?.client?.calendar) {
        setGoogleAuthError("Cannot fetch calendars: Google Calendar API client not available.");
        return;
      }
      try {
        const response = await window.gapi.client.calendar.calendarList.list();
        setCalendars(response.result.items || []);
      } catch (error: any) {
        console.error("Error fetching calendars:", error);
        setGoogleAuthError(`Error fetching calendars: ${error.result?.error?.message || 'Unknown API error'}`);
      }
  }, []);

  const handleGoogleSignIn = () => window.gapi?.auth2?.getAuthInstance()?.signIn();
  const handleGoogleSignOut = () => window.gapi?.auth2?.getAuthInstance()?.signOut();
  
  // --- Lead Management Logic ---
  const handleAddLead = useCallback(async (newLeadData: Omit<Lead, 'id' | 'timestamp' | 'stage' | 'lastStageUpdateTimestamp' | 'contract'> & { documents?: LeadDocument[] }, stage?: LeadStage) => {
    const now = new Date().toISOString();
    const leadToAdd: Lead = { ...newLeadData, id: crypto.randomUUID(), timestamp: now, stage: stage || LeadStage.NEW_LEAD, sender: newLeadData.sender || "Manual Entry", lastStageUpdateTimestamp: now, documents: newLeadData.documents || [], contract: undefined };
    
    try {
        const response = await fetch('/api/leads', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(leadToAdd),
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to save lead: ${errorText}`);
        }
        
        const savedLead = await response.json();
        setLeads(prev => [savedLead, ...prev]);
        setIsAddLeadModalOpen(false);
    } catch (error) {
        console.error("Error saving lead:", error);
        alert('Could not save the new lead.');
    }
  }, []);

  const handleUpdateLeadStage = useCallback(async (leadId: string, newStage: LeadStage) => {
    const leadToUpdate = leads.find(lead => lead.id === leadId);
    if (!leadToUpdate) return;

    const now = new Date().toISOString();
    const updatedLead = { ...leadToUpdate, stage: newStage, lastStageUpdateTimestamp: now };

    setLeads(prevLeads => prevLeads.map(lead => lead.id === leadId ? updatedLead : lead)); // Optimistic update

    try {
        const response = await fetch('/api/leads', {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(updatedLead),
        });
        if (!response.ok) throw new Error('Failed to update lead stage on server');
    } catch (error) {
        console.error(error);
        alert('Failed to save stage update. Reverting.');
        setLeads(prevLeads => prevLeads.map(lead => lead.id === leadId ? leadToUpdate : lead)); // Revert on failure
    }
  }, [leads]);
  
  const handleSaveContract = async (leadId: string, contractDetails: ContractDetails) => {
    const leadToUpdate = leads.find(l => l.id === leadId);
    if (!leadToUpdate) return;
    const updatedLead = { ...leadToUpdate, contract: contractDetails };

    try {
        const response = await fetch('/api/leads', {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(updatedLead),
        });
        if (!response.ok) throw new Error('Failed to save contract');
        const savedLead = await response.json();
        setLeads(prev => prev.map(l => l.id === leadId ? savedLead : l));
        setSelectedLeadForContract(savedLead);
    } catch(error) {
        console.error(error);
        alert("Failed to save contract details.");
    }
  };

  const handleParseLeadWithAI = useCallback(async (text: string): Promise<Partial<Lead>> => {
    try {
      const response = await fetch('/api/parse-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to parse lead with AI');
      }

      const parsedData = await response.json();
      return parsedData;
    } catch (error) {
      console.error("Error parsing lead with AI:", error);
      alert(`Failed to parse lead with AI: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }, []);

  const handleOpenContractModal = (lead: Lead) => { setSelectedLeadForContract(lead); setIsContractModalOpen(true); };
  const handleCloseContractModal = () => { setIsContractModalOpen(false); setSelectedLeadForContract(null); };
  const handleOpenPrintPreview = () => { if (selectedLeadForContract) { setIsPrintableViewOpen(true); } };
  const handleClosePrintPreview = () => { setIsPrintableViewOpen(false); };

  const handleOpenLeadModal = (lead: Lead) => { setSelectedLeadForManagement(lead); setIsLeadManagementModalOpen(true); };
  const handleCloseLeadModal = () => { setIsLeadManagementModalOpen(false); setSelectedLeadForManagement(null); };

  const handleUpdateLead = useCallback(async (updatedLead: Lead) => {
    try {
      const response = await fetch('/api/leads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedLead),
      });
      
      if (!response.ok) throw new Error('Failed to update lead');
      
      const savedLead = await response.json();
      setLeads(prev => prev.map(lead => lead.id === updatedLead.id ? savedLead : lead));
    } catch (error) {
      console.error('Error updating lead:', error);
      alert('Failed to update lead. Please try again.');
      throw error;
    }
  }, []);

  const handleDeleteLead = useCallback(async (leadId: string) => {
    try {
      const response = await fetch(`/api/leads?id=${leadId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete lead');
      
      setLeads(prev => prev.filter(lead => lead.id !== leadId));
    } catch (error) {
      console.error('Error deleting lead:', error);
      alert('Failed to delete lead. Please try again.');
      throw error;
    }
  }, []);

  const filteredLeads = useMemo(() => leads.filter(lead => {
    const searchLower = searchTerm.toLowerCase();
    return (lead.firstName.toLowerCase().includes(searchLower) || lead.lastName.toLowerCase().includes(searchLower) || lead.address.toLowerCase().includes(searchLower) || (lead.claimInfo && lead.claimInfo.toLowerCase().includes(searchLower)));
  }), [leads, searchTerm]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen"><p className="text-xl text-slate-700">Loading application...</p></div>;
  }

  return (
    <>
      {isCalendarFeatureEnabled && <Script src="https://apis.google.com/js/api.js" async defer onLoad={handleGapiLoad}></Script>}
      <div className="flex flex-col h-screen">
        <Header onSearch={setSearchTerm} onAddLead={() => setIsAddLeadModalOpen(true)} currentPage={currentPage} onNavigate={setCurrentPage} isCalendarEnabled={isCalendarFeatureEnabled} />
        {currentPage === 'kanban' && <KanbanBoard leads={filteredLeads} stages={KANBAN_STAGES} onUpdateLeadStage={handleUpdateLeadStage} onOpenContractModal={handleOpenContractModal} onOpenLeadModal={handleOpenLeadModal} onDeleteLead={handleDeleteLead} />}
        {currentPage === 'leads-list' && <LeadsListPage leads={filteredLeads} onOpenContractModal={handleOpenContractModal} onOpenLeadModal={handleOpenLeadModal} onDeleteLead={handleDeleteLead} />}
        {currentPage === 'calendar' && isCalendarFeatureEnabled && <CalendarPage gapiReady={gapiReady} isSignedIn={googleAuthSignedIn} onSignIn={handleGoogleSignIn} onSignOut={handleGoogleSignOut} calendars={calendars} error={googleAuthError} />}
        {isAddLeadModalOpen && <AddLeadModal onClose={() => setIsAddLeadModalOpen(false)} onAddLead={handleAddLead} onParseWithAI={handleParseLeadWithAI} />}
        {isContractModalOpen && selectedLeadForContract && <ContractModal lead={selectedLeadForContract} onClose={handleCloseContractModal} onSaveContract={handleSaveContract} defaultCompanyRep={DEFAULT_COMPANY_REP} onOpenPrintPreview={handleOpenPrintPreview} />}
        {isPrintableViewOpen && selectedLeadForContract && <PrintableContract lead={selectedLeadForContract} onClose={handleClosePrintPreview} />}
        {isLeadManagementModalOpen && selectedLeadForManagement && <LeadManagementModal lead={selectedLeadForManagement} isOpen={isLeadManagementModalOpen} onClose={handleCloseLeadModal} onSave={handleUpdateLead} onDelete={handleDeleteLead} />}
      </div>
    </>
  );
};

export default HomePage;