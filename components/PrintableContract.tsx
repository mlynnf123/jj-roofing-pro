
import React from 'react';
import { Lead } from '../types';

interface PrintableContractProps {
  lead: Lead;
  onClose: () => void;
}

const PrintableContract: React.FC<PrintableContractProps> = ({ lead, onClose }) => {
  if (!lead.contract) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-[100]">
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
          <h2 className="text-xl font-semibold mb-4 text-red-600">Error: Contract Data Missing</h2>
          <p className="mb-6 text-slate-700">Cannot display contract preview because contract data is not available for this lead.</p>
          <button
            onClick={onClose}
            className="w-full bg-slate-500 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded-md transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const { contract, firstName, lastName, address } = lead;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-[100] print:bg-white print:p-0">
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-area, .printable-area * {
            visibility: visible;
          }
          .printable-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: auto;
            margin: 0;
            padding: 20px; /* Adjust as needed for actual contract layout */
            box-shadow: none;
            border: none;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col printable-area">
        <div className="p-6 border-b border-slate-300 no-print">
          <h2 className="text-2xl font-semibold text-slate-800">Contract Preview: {firstName} {lastName}</h2>
        </div>

        {/* Simplified Contract Content Placeholder */}
        <div className="p-6 overflow-y-auto flex-grow custom-scrollbar space-y-4 text-sm">
          <h3 className="text-lg font-bold text-center">JJ Roofing Pros LLC - Contract (Simplified Preview)</h3>
          
          <div className="grid grid-cols-2 gap-4 my-4">
            <div>
              <p><strong>Customer:</strong> {contract.customerName || `${firstName} ${lastName}`}</p>
              <p><strong>Address:</strong> {address}</p>
              <p><strong>Contract Date:</strong> {new Date(contract.contractDate).toLocaleDateString()}</p>
            </div>
            <div>
              <p><strong>Company Representative:</strong></p>
              <p>{contract.companyRepresentativeName}</p>
              <p>{contract.companyRepresentativePhone}</p>
              <p>{contract.companyRepresentativeEmail}</p>
            </div>
          </div>

          {contract.roofingItems && contract.roofingItems.length > 0 && (
            <div>
              <h4 className="font-semibold mt-2 mb-1">Roofing Items:</h4>
              <ul className="list-disc pl-5">
                {contract.roofingItems.map(item => <li key={item.id}>{item.description} (Qty: {item.quantity}, Price: ${item.price})</li>)}
              </ul>
            </div>
          )}

           {contract.gutterItems && contract.gutterItems.length > 0 && (
            <div>
              <h4 className="font-semibold mt-2 mb-1">Gutter Items:</h4>
              <ul className="list-disc pl-5">
                {contract.gutterItems.map(item => <li key={item.id}>{item.description} (Qty: {item.quantity}, Price: ${item.price})</li>)}
              </ul>
            </div>
          )}

           {contract.windowItems && contract.windowItems.length > 0 && (
            <div>
              <h4 className="font-semibold mt-2 mb-1">Window Items:</h4>
              <ul className="list-disc pl-5">
                {contract.windowItems.map(item => <li key={item.id}>{item.description} (Qty: {item.quantity}, Price: ${item.price})</li>)}
              </ul>
            </div>
          )}
          
          <p className="text-right font-bold text-lg mt-4">Grand Total: ${contract.grandTotal}</p>

          <div className="mt-6 border-t pt-4">
             <p>This is a simplified preview. The actual contract contains 8 pages of terms and conditions.</p>
             <p className="mt-4"><strong>Customer Signature Placeholder:</strong> _________________________ Date: _________</p>
             <p className="mt-2"><strong>Company Signature Placeholder:</strong> _________________________ Date: _________</p>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-300 flex justify-end space-x-3 no-print">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-md shadow-sm transition-colors"
          >
            Close Preview
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md shadow-sm transition-colors"
          >
            Print Contract
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrintableContract;
