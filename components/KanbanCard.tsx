import React, { useState, useRef, useEffect } from 'react';
import { Lead } from '../types';
import { UserIcon } from './icons/UserIcon';
import { LocationIcon } from './icons/LocationIcon';
import { ClockIcon } from './icons/ClockIcon';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { PaperclipIcon } from './icons/PaperclipIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { MoreVerticalIcon } from './icons/MoreVerticalIcon';
import { EditIcon } from './icons/EditIcon';
import { DeleteIcon } from './icons/DeleteIcon';

interface KanbanCardProps {
  lead: Lead;
  onDragStart: (event: React.DragEvent<HTMLDivElement>) => void;
  onOpenContractModal: () => void;
  onOpenLeadModal: () => void;
  onDeleteLead?: (leadId: string) => void;
}

const KanbanCard: React.FC<KanbanCardProps> = ({ lead, onDragStart, onOpenContractModal, onOpenLeadModal, onDeleteLead }) => {
  const [isDragging, setIsDragging] = React.useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>) => {
    setIsDragging(true);
    onDragStart(event);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showOptionsMenu && menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowOptionsMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showOptionsMenu]);

  const handleEdit = () => {
    setShowOptionsMenu(false);
    onOpenLeadModal();
  };

  const handleDelete = () => {
    setShowOptionsMenu(false);
    if (onDeleteLead && window.confirm(`Are you sure you want to delete the lead for ${lead.firstName} ${lead.lastName}? This action cannot be undone.`)) {
      onDeleteLead(lead.id);
    }
  };
  
  const formatDate = (isoString: string) => {
    if (!isoString) return 'N/A';
    return new Date(isoString).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };
  
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`bg-white rounded-md p-2 lg:p-3 shadow-md hover:shadow-lg transition-shadow duration-200 cursor-grab border border-slate-100 relative ${isDragging ? 'opacity-50 ring-2 ring-indigo-500' : ''}`}
    >
      {/* Options Menu Button */}
      <div className="absolute top-2 right-2 z-10" ref={menuRef}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowOptionsMenu(!showOptionsMenu);
          }}
          className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors"
          title="More options"
        >
          <MoreVerticalIcon className="w-4 h-4" />
        </button>
        
        {showOptionsMenu && (
          <div className="absolute right-0 mt-1 w-40 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50 border border-slate-200">
            <div className="py-1">
              <button
                onClick={handleEdit}
                className="flex items-center w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <EditIcon className="w-3 h-3 mr-2" />
                Edit Lead
              </button>
              {onDeleteLead && (
                <button
                  onClick={handleDelete}
                  className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <DeleteIcon className="w-3 h-3 mr-2" />
                  Delete Lead
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <h3 className="text-sm lg:text-base font-semibold text-slate-800 mb-2 leading-tight truncate pr-8">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenLeadModal();
          }}
          className="hover:text-blue-600 hover:underline cursor-pointer text-left"
        >
          {lead.firstName}
        </button>{' '}
        {lead.lastName}
      </h3>
      <div className="space-y-1.5 text-sm text-slate-600">
        {lead.address && (
          <p className="flex items-start">
            <LocationIcon className="w-4 h-4 mr-2 text-slate-500 flex-shrink-0 mt-0.5" />
            <span className="break-words leading-tight">{lead.address}</span>
          </p>
        )}
        {lead.time && (
          <p className="flex items-center">
            <ClockIcon className="w-4 h-4 mr-2 text-slate-500 flex-shrink-0" />
            <span className="truncate">{lead.time}</span>
          </p>
        )}
        {lead.claimInfo && (
          <p className="flex items-start">
            <ClipboardIcon className="w-4 h-4 mr-2 text-slate-500 flex-shrink-0 mt-0.5" />
            <span className="break-words leading-tight">Claim: {lead.claimInfo}</span>
          </p>
        )}
      </div>

      {lead.documents && lead.documents.length > 0 && (
        <div className="mt-3 pt-2 border-t border-slate-200">
          <h4 className="text-xs font-medium text-slate-500 mb-1 flex items-center">
            <PaperclipIcon className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
            Attached Documents:
          </h4>
          <ul className="space-y-0.5 text-xs">
            {lead.documents.map(doc => (
              <li key={doc.id}>
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={doc.name}
                  title={`Download ${doc.name} (${formatFileSize(doc.size)})`}
                  className="text-indigo-600 hover:text-indigo-800 hover:underline truncate block"
                >
                  {doc.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-3 pt-2 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
        <span className="truncate">Added: {formatDate(lead.timestamp)}</span>
        {lead.sender && (
          <span className="flex items-center truncate" title={`Added by: ${lead.sender}`}>
             <UserIcon className="w-3.5 h-3.5 mr-1 flex-shrink-0" /> 
             <span className="truncate">{lead.sender.substring(0,12)}{lead.sender.length > 12 ? '...' : ''}</span>
          </span>
        )}
      </div>
      <div className="mt-2 lg:mt-3 pt-2 border-t border-slate-200">
        <button
          onClick={onOpenContractModal}
          className="w-full flex items-center justify-center text-sm text-indigo-600 hover:text-indigo-800 font-medium py-1.5 px-2 lg:px-3 rounded-md hover:bg-indigo-50 transition-colors"
          title="Manage Contract Details"
        >
          <DocumentTextIcon className="w-4 h-4 mr-1 lg:mr-2" />
          <span className="hidden sm:inline">Manage Contract</span>
          <span className="sm:hidden">Contract</span>
        </button>
      </div>
    </div>
  );
};

export default KanbanCard;