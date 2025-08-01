import React from 'react';
import { Lead, LeadStage } from '../types';
import KanbanCard from './KanbanCard';

interface KanbanColumnProps {
  stage: LeadStage;
  leads: Lead[];
  onDragStartCard: (event: React.DragEvent<HTMLDivElement>, leadId: string) => void;
  onDropCard: (event: React.DragEvent<HTMLDivElement>, newStage: LeadStage) => void;
  onDragOverCardContainer: (event: React.DragEvent<HTMLDivElement>) => void;
  onOpenContractModal: (lead: Lead) => void;
  onOpenLeadModal: (lead: Lead) => void;
  onDeleteLead?: (leadId: string) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ stage, leads, onDragStartCard, onDropCard, onDragOverCardContainer, onOpenContractModal, onOpenLeadModal, onDeleteLead }) => {
  return (
    <div
      className="bg-slate-200 rounded-lg p-2 lg:p-3 w-64 lg:w-72 flex-shrink-0 flex flex-col shadow-md"
      onDrop={(e) => onDropCard(e, stage)}
      onDragOver={onDragOverCardContainer}
    >
      <h2 className="text-base lg:text-lg font-semibold text-slate-700 mb-2 lg:mb-3 px-1 sticky top-0 bg-slate-200 py-2 z-10 border-b border-slate-300">
        <span className="block truncate">{stage}</span>
        <span className="text-xs text-slate-500 font-normal">({leads.length})</span>
      </h2>
      <div className="flex-grow space-y-2 overflow-y-auto custom-scrollbar pr-1 min-h-[200px] max-h-[calc(100vh-200px)]">
        {leads.length === 0 && (
          <p className="text-sm text-slate-500 italic text-center py-4">No leads in this stage.</p>
        )}
        {leads.map(lead => (
          <KanbanCard
            key={lead.id}
            lead={lead}
            onDragStart={(e) => onDragStartCard(e, lead.id)}
            onOpenContractModal={() => onOpenContractModal(lead)}
            onOpenLeadModal={() => onOpenLeadModal(lead)}
            onDeleteLead={onDeleteLead}
          />
        ))}
      </div>
    </div>
  );
};

export default KanbanColumn;