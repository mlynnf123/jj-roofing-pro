
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Lead, LeadStage } from '../types';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { ArrowUpIcon } from './icons/ArrowUpIcon';
import { ArrowDownIcon } from './icons/ArrowDownIcon';
import { MoreVerticalIcon } from './icons/MoreVerticalIcon';
import { EditIcon } from './icons/EditIcon';
import { DeleteIcon } from './icons/DeleteIcon';

interface LeadsListPageProps {
  leads: Lead[];
  onOpenContractModal: (lead: Lead) => void;
  onOpenLeadModal: (lead: Lead) => void;
  onDeleteLead?: (leadId: string) => void;
}

type SortableKey = 'name' | 'address' | 'stage' | 'timestamp' | 'sender' | 'claimInfo';

const stageColorMap: Record<LeadStage, string> = {
  [LeadStage.NEW_LEAD]: 'bg-blue-100 text-blue-800',
  [LeadStage.CONTACTED]: 'bg-yellow-100 text-yellow-800',
  [LeadStage.INSPECTION_SCHEDULED]: 'bg-purple-100 text-purple-800',
  [LeadStage.PROPOSAL_SENT]: 'bg-indigo-100 text-indigo-800',
  [LeadStage.CLOSED_WON]: 'bg-green-100 text-green-800',
  [LeadStage.CLOSED_LOST]: 'bg-red-100 text-red-800',
};

const LeadsListPage: React.FC<LeadsListPageProps> = ({ leads, onOpenContractModal, onOpenLeadModal, onDeleteLead }) => {
  const [sortConfig, setSortConfig] = useState<{ key: SortableKey; direction: 'ascending' | 'descending' }>({ key: 'timestamp', direction: 'descending' });
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const sortedLeads = useMemo(() => {
    let sortableItems = [...leads];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aValue: string | number;
        let bValue: string | number;

        if (sortConfig.key === 'name') {
          aValue = `${a.firstName} ${a.lastName}`.toLowerCase();
          bValue = `${b.firstName} ${b.lastName}`.toLowerCase();
        } else if (sortConfig.key === 'timestamp') {
          aValue = new Date(a.timestamp).getTime();
          bValue = new Date(b.timestamp).getTime();
        } else {
          aValue = (a[sortConfig.key] || '').toString().toLowerCase();
          bValue = (b[sortConfig.key] || '').toString().toLowerCase();
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [leads, sortConfig]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openMenuId && menuRefs.current[openMenuId] && !menuRefs.current[openMenuId]?.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenuId]);

  const requestSort = (key: SortableKey) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleMenuToggle = (leadId: string) => {
    setOpenMenuId(openMenuId === leadId ? null : leadId);
  };

  const handleEdit = (lead: Lead) => {
    setOpenMenuId(null);
    onOpenLeadModal(lead);
  };

  const handleDelete = (leadId: string, leadName: string) => {
    setOpenMenuId(null);
    if (onDeleteLead && window.confirm(`Are you sure you want to delete the lead for ${leadName}? This action cannot be undone.`)) {
      onDeleteLead(leadId);
    }
  };

  const renderSortArrow = (key: SortableKey) => {
    if (sortConfig.key !== key) return null;
    if (sortConfig.direction === 'ascending') {
      return <ArrowUpIcon className="w-3 h-3 ml-1" />;
    }
    return <ArrowDownIcon className="w-3 h-3 ml-1" />;
  };
  
  const formatDate = (isoString: string) => {
    if (!isoString) return 'N/A';
    return new Date(isoString).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const renderHeaderCell = (label: string, key: SortableKey) => (
    <th
      scope="col"
      className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
      onClick={() => requestSort(key)}
      aria-sort={sortConfig.key === key ? sortConfig.direction : 'none'}
    >
      <div className="flex items-center">
        {label}
        {renderSortArrow(key)}
      </div>
    </th>
  );

  return (
    <div className="p-4 sm:p-6 flex-grow">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="overflow-auto custom-scrollbar max-h-[calc(100vh-200px)]">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50 sticky top-0 z-10">
              <tr>
                {renderHeaderCell('Customer Name', 'name')}
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Phone</th>
                {renderHeaderCell('Address', 'address')}
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Claim #</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Insurance Co</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Next Set Date</th>
                {renderHeaderCell('Stage', 'stage')}
                {renderHeaderCell('Sales Rep', 'sender')}
                {renderHeaderCell('Date Added', 'timestamp')}
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Contract</th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {sortedLeads.length > 0 ? (
                sortedLeads.map(lead => (
                  <tr key={lead.id} className="hover:bg-slate-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                      <button
                        onClick={() => onOpenLeadModal(lead)}
                        className="hover:text-blue-600 hover:underline cursor-pointer text-left"
                      >
                        {lead.firstName}
                      </button>{' '}
                      {lead.lastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {lead.phoneNumber && lead.phoneNumber !== 'Phone not specified' ? lead.phoneNumber : 'Not specified'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{lead.address}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {lead.claimNumber && lead.claimNumber !== 'Claim number not specified' ? lead.claimNumber : 'Not specified'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {lead.claimCompany && lead.claimCompany !== 'Insurance company not specified' ? lead.claimCompany : 'Not specified'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{lead.nextSetDate || 'Not specified'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${stageColorMap[lead.stage] || 'bg-gray-100 text-gray-800'}`}>
                        {lead.stage}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{lead.sender || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{formatDate(lead.timestamp)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => onOpenContractModal(lead)}
                        className="text-indigo-600 hover:text-indigo-900 flex items-center"
                        title="Manage Contract Details"
                      >
                         <DocumentTextIcon className="w-4 h-4 mr-1" />
                        Contract
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="relative" ref={(el) => { menuRefs.current[lead.id] = el; }}>
                        <button
                          onClick={() => handleMenuToggle(lead.id)}
                          className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors"
                          title="More options"
                        >
                          <MoreVerticalIcon className="w-5 h-5" />
                        </button>
                        
                        {openMenuId === lead.id && (
                          <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                            <div className="py-1">
                              <button
                                onClick={() => handleEdit(lead)}
                                className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
                              >
                                <EditIcon className="w-4 h-4 mr-3" />
                                Edit Lead
                              </button>
                              {onDeleteLead && (
                                <button
                                  onClick={() => handleDelete(lead.id, `${lead.firstName} ${lead.lastName}`)}
                                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                >
                                  <DeleteIcon className="w-4 h-4 mr-3" />
                                  Delete Lead
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={11} className="px-6 py-12 text-center text-sm text-slate-500">
                    No leads found. Try a different search term or add a new lead.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LeadsListPage;
