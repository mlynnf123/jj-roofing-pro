import React from 'react';
import { Lead, LeadStage } from '../types';
import KanbanColumn from './KanbanColumn';

interface KanbanBoardProps {
  leads: Lead[];
  stages: LeadStage[];
  onUpdateLeadStage: (leadId: string, newStage: LeadStage) => void;
  onOpenContractModal: (lead: Lead) => void;
  onOpenLeadModal: (lead: Lead) => void;
  onDeleteLead?: (leadId: string) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ leads, stages, onUpdateLeadStage, onOpenContractModal, onOpenLeadModal, onDeleteLead }) => {
  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, leadId: string) => {
    event.dataTransfer.setData('leadId', leadId);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>, newStage: LeadStage) => {
    event.preventDefault();
    const leadId = event.dataTransfer.getData('leadId');
    if (leadId) {
      onUpdateLeadStage(leadId, newStage);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault(); // Necessary to allow dropping
  };

  return (
    <main className="flex-grow p-2 lg:p-4 overflow-x-auto overflow-y-hidden custom-scrollbar mobile-scroll relative">
      {/* Left fade gradient */}
      <div className="lg:hidden absolute left-0 top-0 bottom-0 w-4 scroll-fade-left z-20 pointer-events-none"></div>
      
      {/* Right fade gradient */}
      <div className="lg:hidden absolute right-0 top-0 bottom-0 w-4 scroll-fade-right z-20 pointer-events-none"></div>
      
      <div className="flex space-x-4 lg:space-x-6 min-w-max h-full pb-4 px-3 lg:px-2">
        {stages.map(stage => (
          <KanbanColumn
            key={stage}
            stage={stage}
            leads={leads.filter(lead => lead.stage === stage)}
            onDragStartCard={handleDragStart}
            onDropCard={handleDrop}
            onDragOverCardContainer={handleDragOver}
            onOpenContractModal={onOpenContractModal}
            onOpenLeadModal={onOpenLeadModal}
            onDeleteLead={onDeleteLead}
          />
        ))}
      </div>
      
      {/* Mobile scroll indicator */}
      <div className="lg:hidden fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-slate-800 bg-opacity-80 text-white text-xs px-4 py-2 rounded-full pointer-events-none z-30 backdrop-blur-sm">
        ← Swipe to scroll columns →
      </div>
    </main>
  );
};

export default KanbanBoard;