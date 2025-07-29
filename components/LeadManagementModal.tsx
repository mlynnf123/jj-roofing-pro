import React, { useState, useEffect } from 'react';
import { Lead, LeadStage } from '../types';
import { XMarkIcon } from './icons/XMarkIcon';
import { TrashIcon } from './icons/TrashIcon';
import { PencilIcon } from './icons/PencilIcon';

interface LeadManagementModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedLead: Lead) => void;
  onDelete: (leadId: string) => void;
}

const LeadManagementModal: React.FC<LeadManagementModalProps> = ({
  lead,
  isOpen,
  onClose,
  onSave,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedLead, setEditedLead] = useState<Lead | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (lead) {
      setEditedLead({ ...lead });
    }
  }, [lead]);

  const handleSave = async () => {
    if (!editedLead) return;
    
    try {
      await onSave(editedLead);
      setIsEditing(false);
      onClose();
    } catch (error) {
      console.error('Error saving lead:', error);
    }
  };

  const handleDelete = async () => {
    if (!lead) return;
    
    setIsDeleting(true);
    try {
      await onDelete(lead.id);
      setShowDeleteConfirm(false);
      onClose();
    } catch (error) {
      console.error('Error deleting lead:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleInputChange = (field: keyof Lead, value: string) => {
    if (!editedLead) return;
    
    setEditedLead({
      ...editedLead,
      [field]: value
    });
  };

  if (!isOpen || !lead || !editedLead) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-800">Lead Management</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {!isEditing ? (
            // View Mode
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">
                  {lead.firstName} {lead.lastName}
                </h3>
                <p className="text-slate-600">{lead.address}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-slate-700">Stage:</span>
                  <p className="text-slate-600">{lead.stage}</p>
                </div>
                <div>
                  <span className="font-medium text-slate-700">Time:</span>
                  <p className="text-slate-600">{lead.time || 'N/A'}</p>
                </div>
                <div className="col-span-2">
                  <span className="font-medium text-slate-700">Claim Info:</span>
                  <p className="text-slate-600">{lead.claimInfo || 'N/A'}</p>
                </div>
                <div>
                  <span className="font-medium text-slate-700">Source:</span>
                  <p className="text-slate-600">{lead.sender || 'N/A'}</p>
                </div>
                <div>
                  <span className="font-medium text-slate-700">Added:</span>
                  <p className="text-slate-600">
                    {new Date(lead.timestamp).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <PencilIcon className="w-4 h-4 mr-2" />
                  Edit
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  <TrashIcon className="w-4 h-4 mr-2" />
                  Delete
                </button>
              </div>
            </div>
          ) : (
            // Edit Mode
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={editedLead.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={editedLead.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={editedLead.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Stage
                </label>
                <select
                  value={editedLead.stage}
                  onChange={(e) => handleInputChange('stage', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={LeadStage.NEW_LEAD}>New Lead</option>
                  <option value={LeadStage.CONTACTED}>Contacted</option>
                  <option value={LeadStage.INSPECTION_SCHEDULED}>Inspection Scheduled</option>
                  <option value={LeadStage.PROPOSAL_SENT}>Proposal Sent</option>
                  <option value={LeadStage.CLOSED_WON}>Closed Won</option>
                  <option value={LeadStage.CLOSED_LOST}>Closed Lost</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Time
                </label>
                <input
                  type="text"
                  value={editedLead.time || ''}
                  onChange={(e) => handleInputChange('time', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Monday 10am"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Claim Info
                </label>
                <textarea
                  value={editedLead.claimInfo || ''}
                  onChange={(e) => handleInputChange('claimInfo', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Insurance claim details"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditedLead({ ...lead });
                  }}
                  className="px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-60">
              <div className="bg-white rounded-lg max-w-sm w-full p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">
                  Delete Lead
                </h3>
                <p className="text-slate-600 mb-6">
                  Are you sure you want to delete {lead.firstName} {lead.lastName}? This action cannot be undone.
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeadManagementModal;