
import React, { useState, useCallback } from 'react';
import { Lead, LeadStage, LeadDocument } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';
import Loader from './Loader';
import { PaperclipIcon } from './icons/PaperclipIcon'; // Import PaperclipIcon

interface AddLeadModalProps {
  onClose: () => void;
  onAddLead: (newLeadData: Omit<Lead, 'id' | 'timestamp' | 'stage' | 'lastStageUpdateTimestamp'> & { documents?: LeadDocument[] }, stage?: LeadStage) => void;
  onParseWithAI: (text: string) => Promise<Partial<Lead>>;
}

const AddLeadModal: React.FC<AddLeadModalProps> = ({ onClose, onAddLead, onParseWithAI }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [time, setTime] = useState('');
  const [claimInfo, setClaimInfo] = useState('');
  const [originalMessage, setOriginalMessage] = useState('');
  const [sender, setSender] = useState('Manual Entry');
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFiles(Array.from(event.target.files));
    }
  };

  const processFiles = async (files: File[]): Promise<LeadDocument[]> => {
    setIsProcessingFiles(true);
    const documentPromises = files.map(file => {
      return new Promise<LeadDocument>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve({
            id: crypto.randomUUID(),
            name: file.name,
            type: file.type,
            size: file.size,
            url: e.target?.result as string,
          });
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
      });
    });
    try {
        const docs = await Promise.all(documentPromises);
        return docs;
    } finally {
        setIsProcessingFiles(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firstName || !lastName || !address) {
      alert("First Name, Last Name, and Address are required.");
      return;
    }
    
    let documents: LeadDocument[] = [];
    if (selectedFiles.length > 0) {
      documents = await processFiles(selectedFiles);
    }
    
    const leadData = { firstName, lastName, address, time, claimInfo, originalMessage, sender, documents };
    onAddLead(leadData);
  };

  const handleRawTextParse = useCallback(async () => {
    if (!originalMessage.trim()) {
      alert("Please enter some lead information in the 'Raw Lead Notes' field to parse.");
      return;
    }
    setIsLoadingAI(true);
    try {
      const parsedData = await onParseWithAI(originalMessage);
      if (parsedData.firstName) setFirstName(parsedData.firstName);
      if (parsedData.lastName) setLastName(parsedData.lastName);
      if (parsedData.address) setAddress(parsedData.address);
      if (parsedData.time) setTime(parsedData.time);
      if (parsedData.claimInfo) setClaimInfo(parsedData.claimInfo);
      setSender("AI Parsed");
    } catch (error) {
      // Error already handled by App.tsx
    } finally {
      setIsLoadingAI(false);
    }
  }, [originalMessage, onParseWithAI]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-2 sm:p-4 z-50 transition-opacity duration-300">
      <div className="bg-white rounded-lg shadow-2xl p-4 sm:p-6 lg:p-8 w-full max-w-lg max-h-[95vh] sm:max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-slate-800">Add New Lead</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700 text-2xl" aria-label="Close modal">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="rawMessage" className="block text-sm font-medium text-slate-700 mb-1">Raw Lead Notes (for AI Parsing)</label>
            <textarea
              id="rawMessage"
              value={originalMessage}
              onChange={(e) => setOriginalMessage(e.target.value)}
              placeholder="Paste lead details here..."
              rows={4}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            <button
              type="button"
              onClick={handleRawTextParse}
              disabled={isLoadingAI || !originalMessage.trim() || isProcessingFiles}
              className="mt-2 w-full sm:w-auto flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-slate-400"
            >
              {isLoadingAI ? <Loader size="sm" /> : <SparklesIcon className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />}
              Parse with AI
            </button>
          </div>

          <hr className="my-6 border-slate-300"/>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-slate-700">First Name <span className="text-red-500">*</span></label>
              <input type="text" id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-slate-700">Last Name <span className="text-red-500">*</span></label>
              <input type="text" id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
          </div>
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-slate-700">Address <span className="text-red-500">*</span></label>
            <input type="text" id="address" value={address} onChange={(e) => setAddress(e.target.value)} required className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
          </div>
          <div>
            <label htmlFor="time" className="block text-sm font-medium text-slate-700">Appointment Time</label>
            <input type="text" id="time" value={time} onChange={(e) => setTime(e.target.value)} className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
          </div>
          <div>
            <label htmlFor="claimInfo" className="block text-sm font-medium text-slate-700">Claim Information</label>
            <input type="text" id="claimInfo" value={claimInfo} onChange={(e) => setClaimInfo(e.target.value)} className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
          </div>
           <div>
            <label htmlFor="sender" className="block text-sm font-medium text-slate-700">Source / Sender</label>
            <input type="text" id="sender" value={sender} onChange={(e) => setSender(e.target.value)} placeholder="e.g., Manual Entry, AI Parsed" className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
          </div>

          <div>
            <label htmlFor="documents" className="block text-sm font-medium text-slate-700">Attach Documents</label>
            <input 
              type="file" 
              id="documents" 
              multiple 
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
            {selectedFiles.length > 0 && (
              <div className="mt-2 text-xs text-slate-600">
                <p>{selectedFiles.length} file(s) selected:</p>
                <ul className="list-disc pl-5">
                  {selectedFiles.map(file => <li key={file.name}>{file.name} ({(file.size / 1024).toFixed(1)} KB)</li>)}
                </ul>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
            <button 
              type="button" 
              onClick={onClose} 
              disabled={isProcessingFiles}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isLoadingAI || isProcessingFiles}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-slate-400 flex items-center justify-center"
            >
              {isProcessingFiles && <Loader size="sm" color="text-white" />}
              {isProcessingFiles ? <span className="ml-2">Processing...</span> : 'Save Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLeadModal;
