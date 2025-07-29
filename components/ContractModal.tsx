import React, { useState, useEffect } from 'react';
import { Lead, ContractDetails, ContractLineItem, PaymentScheduleItem } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon'; 
import { PrinterIcon } from './icons/PrinterIcon'; 

interface ContractModalProps {
  lead: Lead;
  onClose: () => void;
  onSaveContract: (leadId: string, contractDetails: ContractDetails) => void;
  defaultCompanyRep: { name: string; phone: string; email: string; };
  onOpenPrintPreview: () => void;
}

const getInitialContractDetails = (lead: Lead, rep: ContractModalProps['defaultCompanyRep']): ContractDetails => {
  return {
    contractDate: new Date().toISOString().split('T')[0],
    customerName: `${lead.firstName} ${lead.lastName}`,
    companyRepresentativeName: rep.name,
    companyRepresentativePhone: rep.phone,
    companyRepresentativeEmail: rep.email,
    roofingItems: [],
    gutterItems: [],
    windowItems: [],
    grandTotal: "0.00",
    paymentSchedule: [
      { id: crypto.randomUUID(), description: "First Payment (Due upon Start of Job/Material Delivery)", amount: ""},
      { id: crypto.randomUUID(), description: "Second Payment (Due upon Completion of Roof)", amount: ""},
      { id: crypto.randomUUID(), description: "Final Payment (Due upon Job Completion *INS INVOICE*)", amount: ""},
    ],
    deductible: "",
    nonRecoverableDepreciation: "",
    upgrades: "",
    discounts: "",
    workNotDoing: "",
    remainingBalanceOnDeductibleAndUpgrades: "",
    shingleTypeColorDelivery: "",
    existingPropertyDamage: "",
    initialsConstructionSiteCaution: false,
    initialsDrivewayUsage: false,
    initialsPuncturedLines: false,
    initialsTermsOnReverseSide: false,
    initialsRightOfRescissionConfirmation: false,
    initialsDisclosureConfirmation: false,
    thirdPartyAuthHomeownerName: `${lead.firstName} ${lead.lastName}`,
    thirdPartyAuthPropertyAddress: lead.address,
    thirdPartyAuthInsuranceCompany: "",
    thirdPartyAuthClaimNumber: lead.claimInfo || "",
    thirdPartyAuthRequestInspections: false,
    thirdPartyAuthDiscussSupplements: false,
    thirdPartyAuthIssuedPaymentDiscussions: false,
    thirdPartyAuthRequestClaimPaymentStatus: false,
  };
};


const ContractModal: React.FC<ContractModalProps> = ({ lead, onClose, onSaveContract, defaultCompanyRep, onOpenPrintPreview }) => {
  const [details, setDetails] = useState<ContractDetails>(
    lead.contract ? { ...lead.contract } : getInitialContractDetails(lead, defaultCompanyRep)
  );

  useEffect(() => {
    // If lead or contract on lead changes, update form
    setDetails(lead.contract ? { ...lead.contract } : getInitialContractDetails(lead, defaultCompanyRep));
  }, [lead, defaultCompanyRep]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setDetails(prev => ({ ...prev, [name]: checked }));
    } else {
      setDetails(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleItemChange = (
    itemType: 'roofingItems' | 'gutterItems' | 'windowItems' | 'paymentSchedule',
    index: number,
    field: keyof ContractLineItem | keyof PaymentScheduleItem,
    value: string
  ) => {
    setDetails(prev => {
      const items = [...prev[itemType]] as any[];
      items[index] = { ...items[index], [field]: value };
      return { ...prev, [itemType]: items };
    });
  };

  const addItem = (itemType: 'roofingItems' | 'gutterItems' | 'windowItems' | 'paymentSchedule') => {
    let newItem: ContractLineItem | PaymentScheduleItem;
    if (itemType === 'paymentSchedule') {
        newItem = { id: crypto.randomUUID(), description: '', amount: '' };
    } else {
        newItem = { id: crypto.randomUUID(), description: '', quantity: '', price: '' };
    }
    setDetails(prev => ({ ...prev, [itemType]: [...prev[itemType], newItem] as any[]}));
  };

  const removeItem = (itemType: 'roofingItems' | 'gutterItems' | 'windowItems' | 'paymentSchedule', index: number) => {
    setDetails(prev => ({
      ...prev,
      [itemType]: (prev[itemType] as any[]).filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveContract(lead.id, details);
  };
  
  // Helper to render line item inputs
  const renderLineItems = (itemType: 'roofingItems' | 'gutterItems' | 'windowItems', title: string) => (
    <div className="space-y-3 p-3 border border-slate-200 rounded-md">
      <h4 className="text-md font-semibold text-slate-700">{title}</h4>
      {(details[itemType] as ContractLineItem[]).map((item, index) => (
        <div key={item.id || index} className="grid grid-cols-12 gap-2 items-center">
          <input type="text" placeholder="Description" value={item.description} onChange={e => handleItemChange(itemType, index, 'description', e.target.value)} className="col-span-6 mt-1 w-full px-2 py-1 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm" />
          <input type="text" placeholder="Qty" value={item.quantity} onChange={e => handleItemChange(itemType, index, 'quantity', e.target.value)} className="col-span-2 mt-1 w-full px-2 py-1 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm" />
          <input type="text" placeholder="Price" value={item.price} onChange={e => handleItemChange(itemType, index, 'price', e.target.value)} className="col-span-3 mt-1 w-full px-2 py-1 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm" />
          <button type="button" onClick={() => removeItem(itemType, index)} className="col-span-1 text-red-500 hover:text-red-700">
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      ))}
      <button type="button" onClick={() => addItem(itemType)} className="text-indigo-700 bg-indigo-100 hover:bg-indigo-200 border border-indigo-300 focus:ring-indigo-500 flex items-center px-2 py-1 text-xs font-medium rounded-md shadow-sm">
        <PlusIcon className="w-4 h-4 mr-1" /> Add {title.slice(0,-1)}
      </button>
    </div>
  );

  const renderPaymentScheduleItems = () => (
    <div className="space-y-3 p-3 border border-slate-200 rounded-md">
      <h4 className="text-md font-semibold text-slate-700">Payment Schedule</h4>
      {(details.paymentSchedule).map((item, index) => (
        <div key={item.id || index} className="grid grid-cols-12 gap-2 items-center">
          <input type="text" placeholder="Description" value={item.description} onChange={e => handleItemChange('paymentSchedule', index, 'description', e.target.value)} className="col-span-8 mt-1 w-full px-2 py-1 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm" />
          <input type="text" placeholder="Amount" value={item.amount} onChange={e => handleItemChange('paymentSchedule', index, 'amount', e.target.value)} className="col-span-3 mt-1 w-full px-2 py-1 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm" />
          <button type="button" onClick={() => removeItem('paymentSchedule', index)} className="col-span-1 text-red-500 hover:text-red-700">
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      ))}
      <button type="button" onClick={() => addItem('paymentSchedule')} className="text-indigo-700 bg-indigo-100 hover:bg-indigo-200 border border-indigo-300 focus:ring-indigo-500 flex items-center px-2 py-1 text-xs font-medium rounded-md shadow-sm">
        <PlusIcon className="w-4 h-4 mr-1" /> Add Payment Item
      </button>
    </div>
  );
  
  const renderCheckbox = (label: string, name: keyof ContractDetails) => (
      <label className="flex items-center space-x-2 text-sm">
        <input type="checkbox" name={name} checked={!!details[name]} onChange={handleChange} className="form-checkbox h-4 w-4 text-indigo-600"/>
        <span>{label}</span>
      </label>
  );


  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh]">
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-slate-200">
          <h2 className="text-xl sm:text-2xl font-semibold text-slate-800">Contract Details for {lead.firstName} {lead.lastName}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700 text-2xl" aria-label="Close modal">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="overflow-y-auto custom-scrollbar p-4 sm:p-6 space-y-4 max-h-[calc(90vh-140px)]">
          {/* General Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-slate-700">Contract Date</label><input type="date" name="contractDate" value={details.contractDate} onChange={handleChange} className="mt-1 w-full px-2 py-1 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm" /></div>
            <div><label className="block text-sm font-medium text-slate-700">Customer Name</label><input type="text" name="customerName" value={details.customerName || ''} onChange={handleChange} className="mt-1 w-full px-2 py-1 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm" /></div>
          </div>
          <details className="border border-slate-200 rounded p-2 text-sm">
            <summary className="font-medium cursor-pointer">Company Representative</summary>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                <div><label className="block text-xs font-medium text-slate-600">Name</label><input type="text" name="companyRepresentativeName" value={details.companyRepresentativeName} onChange={handleChange} className="mt-1 w-full px-1.5 py-0.5 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-xs" /></div>
                <div><label className="block text-xs font-medium text-slate-600">Phone</label><input type="text" name="companyRepresentativePhone" value={details.companyRepresentativePhone} onChange={handleChange} className="mt-1 w-full px-1.5 py-0.5 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-xs" /></div>
                <div><label className="block text-xs font-medium text-slate-600">Email</label><input type="email" name="companyRepresentativeEmail" value={details.companyRepresentativeEmail} onChange={handleChange} className="mt-1 w-full px-1.5 py-0.5 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-xs" /></div>
            </div>
          </details>

          {/* Service Items */}
          {renderLineItems('roofingItems', 'Roofing Items')}
          {renderLineItems('gutterItems', 'Gutter Items')}
          {renderLineItems('windowItems', 'Window Items')}

          <div><label className="block text-sm font-medium text-slate-700">Grand Total ($)</label><input type="text" name="grandTotal" value={details.grandTotal} onChange={handleChange} placeholder="e.g., 14,094.33" className="mt-1 w-full px-2 py-1 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm" /></div>
          
          {renderPaymentScheduleItems()}

          <details className="border border-slate-200 rounded p-2 text-sm">
            <summary className="font-medium cursor-pointer">Page 2 - Contract Worksheet</summary>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
              <div><label className="block text-xs font-medium text-slate-600">Deductible</label><input type="text" name="deductible" value={details.deductible || ''} onChange={handleChange} className="mt-1 w-full px-1.5 py-0.5 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-xs" /></div>
              <div><label className="block text-xs font-medium text-slate-600">Non-Recoverable Depreciation</label><input type="text" name="nonRecoverableDepreciation" value={details.nonRecoverableDepreciation || ''} onChange={handleChange} className="mt-1 w-full px-1.5 py-0.5 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-xs" /></div>
              <div className="md:col-span-2"><label className="block text-xs font-medium text-slate-600">Upgrades</label><textarea name="upgrades" value={details.upgrades || ''} onChange={handleChange} rows={2} placeholder="e.g., OC TRU DEF DURATION CLASS 3 IR, SYNTHETIC UL, I&W, LIFETIME WARRANTY" className="mt-1 w-full px-1.5 py-0.5 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-xs" /></div>
              <div><label className="block text-xs font-medium text-slate-600">Discounts</label><input type="text" name="discounts" value={details.discounts || ''} onChange={handleChange} placeholder="e.g., STORM" className="mt-1 w-full px-1.5 py-0.5 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-xs" /></div>
              <div><label className="block text-xs font-medium text-slate-600">Work Not Doing</label><input type="text" name="workNotDoing" value={details.workNotDoing || ''} onChange={handleChange} placeholder="e.g., GUTTERS, BEADING" className="mt-1 w-full px-1.5 py-0.5 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-xs" /></div>
              <div className="md:col-span-2"><label className="block text-xs font-medium text-slate-600">Remaining Balance On Deductible and Upgrades</label><input type="text" name="remainingBalanceOnDeductibleAndUpgrades" value={details.remainingBalanceOnDeductibleAndUpgrades || ''} onChange={handleChange} className="mt-1 w-full px-1.5 py-0.5 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-xs" /></div>
            </div>
          </details>
          
          <details className="border border-slate-200 rounded p-2 text-sm">
            <summary className="font-medium cursor-pointer">Page 4 - Review and Initials</summary>
            <div className="space-y-2 mt-2">
              <div><label className="block text-xs font-medium text-slate-600">Shingle Type/Color/Delivery Instructions</label><textarea name="shingleTypeColorDelivery" value={details.shingleTypeColorDelivery} onChange={handleChange} rows={2} placeholder="e.g., Shingles | Lifetime | Owens Corning | Duration Class 3 / None / None" className="mt-1 w-full px-1.5 py-0.5 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-xs" /></div>
              <div><label className="block text-xs font-medium text-slate-600">Existing Property Damage</label><textarea name="existingPropertyDamage" value={details.existingPropertyDamage} onChange={handleChange} rows={2} placeholder="e.g., Fascia Rot, Driveway Cracks, etc. or None" className="mt-1 w-full px-1.5 py-0.5 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-xs" /></div>
              <h5 className="font-medium text-xs mt-2">Liability Disclosure Addendum: Initial Below</h5>
              {renderCheckbox("Construction Site Caution: I understand and accept risks.", "initialsConstructionSiteCaution")}
              {renderCheckbox("Driveway Usage: All JJR vehicles are rated for driveway usage.", "initialsDrivewayUsage")}
              {renderCheckbox("Punctured Lines: Not JJR responsibility during installation.", "initialsPuncturedLines")}
              {renderCheckbox("Terms on Reverse Side: I have read and understand.", "initialsTermsOnReverseSide")}
              <h5 className="font-medium text-xs mt-2">Right of Rescission and Property Disclosure: Initial Below</h5>
              {renderCheckbox("Right of Rescission Confirmed (3-day right).", "initialsRightOfRescissionConfirmation")}
              {renderCheckbox("Property Code §53.255 Disclosure Confirmed.", "initialsDisclosureConfirmation")}
            </div>
          </details>

          <details className="border border-slate-200 rounded p-2 text-sm">
            <summary className="font-medium cursor-pointer">Page 6 - Third Party Authorization</summary>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
              <div><label className="block text-xs font-medium text-slate-600">Homeowner Name(s)</label><input type="text" name="thirdPartyAuthHomeownerName" value={details.thirdPartyAuthHomeownerName || ''} onChange={handleChange} className="mt-1 w-full px-1.5 py-0.5 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-xs" /></div>
              <div><label className="block text-xs font-medium text-slate-600">Property Address</label><input type="text" name="thirdPartyAuthPropertyAddress" value={details.thirdPartyAuthPropertyAddress || ''} onChange={handleChange} className="mt-1 w-full px-1.5 py-0.5 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-xs" /></div>
              <div><label className="block text-xs font-medium text-slate-600">Insurance Company</label><input type="text" name="thirdPartyAuthInsuranceCompany" value={details.thirdPartyAuthInsuranceCompany || ''} onChange={handleChange} className="mt-1 w-full px-1.5 py-0.5 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-xs" /></div>
              <div><label className="block text-xs font-medium text-slate-600">Claim Number</label><input type="text" name="thirdPartyAuthClaimNumber" value={details.thirdPartyAuthClaimNumber || ''} onChange={handleChange} className="mt-1 w-full px-1.5 py-0.5 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-xs" /></div>
              <div className="md:col-span-2 space-y-1 mt-1">
                <p className="text-xs text-slate-600">I/We authorize JJ Roofing Pros LLC for the following regarding my claim:</p>
                {renderCheckbox("Request Inspections", "thirdPartyAuthRequestInspections")}
                {renderCheckbox("Discuss and Request Supplements", "thirdPartyAuthDiscussSupplements")}
                {renderCheckbox("Issued payment discussions and all insurance paperwork discussions", "thirdPartyAuthIssuedPaymentDiscussions")}
                {renderCheckbox("Request Claim Payment Status (Recoverable Depreciation & Supplements)", "thirdPartyAuthRequestClaimPaymentStatus")}
              </div>
            </div>
          </details>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 sticky bottom-0 bg-white py-4 px-6 -mx-6">
            <button 
              type="button" 
              onClick={onOpenPrintPreview} 
              className="px-4 py-2 text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 focus:ring-slate-500 disabled:opacity-50 flex items-center" 
              disabled={!lead.contract} // Disable if no contract data is saved yet
            >
              <PrinterIcon className="w-4 h-4 mr-2" /> Preview & Print
            </button>
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 focus:ring-slate-500 disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500"
            >
              Save Contract Details
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContractModal;