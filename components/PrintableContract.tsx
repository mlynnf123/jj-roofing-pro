
import React from 'react';
import Image from 'next/image';
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

        {/* Contract Content */}
        <div className="overflow-y-auto flex-grow custom-scrollbar">
          {/* Page 1 - Main Contract */}
          <div className="p-8 space-y-6 text-sm min-h-screen print:min-h-0">
            {/* Header with Logo */}
            <div className="flex items-center justify-center mb-8 print:mb-6">
              <div className="flex items-center gap-4">
                <Image 
                  src="/Austin, TX.png" 
                  alt="JJ Roofing Logo" 
                  width={80} 
                  height={80}
                  className="object-contain"
                />
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-slate-900">JJ ROOFING PROS LLC</h1>
                  <p className="text-sm text-slate-600">Professional Roofing Services</p>
                </div>
              </div>
            </div>

            <div className="text-center mb-6">
              <h2 className="text-xl font-bold">ROOFING CONTRACT</h2>
              <p className="text-sm mt-2">Contract Date: {new Date(contract.contractDate).toLocaleDateString()}</p>
            </div>

            {/* Customer and Company Information */}
            <div className="grid grid-cols-2 gap-8 mb-6">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold border-b border-slate-300 pb-1">CUSTOMER INFORMATION</h3>
                <p><strong>Name:</strong> {contract.customerName || `${firstName} ${lastName}`}</p>
                <p><strong>Address:</strong> {address}</p>
                <p><strong>Phone:</strong> {lead.phoneNumber || 'Not provided'}</p>
                {lead.claimNumber && <p><strong>Claim #:</strong> {lead.claimNumber}</p>}
                {lead.claimCompany && <p><strong>Insurance:</strong> {lead.claimCompany}</p>}
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold border-b border-slate-300 pb-1">COMPANY REPRESENTATIVE</h3>
                <p><strong>Name:</strong> {contract.companyRepresentativeName}</p>
                <p><strong>Phone:</strong> {contract.companyRepresentativePhone}</p>
                <p><strong>Email:</strong> {contract.companyRepresentativeEmail}</p>
              </div>
            </div>

            {/* Work Description */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold border-b border-slate-300 pb-1 mb-4">WORK TO BE PERFORMED</h3>
              
              {contract.roofingItems && contract.roofingItems.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">ROOFING SERVICES:</h4>
                  <table className="w-full border border-slate-300 text-xs">
                    <thead className="bg-slate-100">
                      <tr>
                        <th className="border border-slate-300 p-2 text-left">Description</th>
                        <th className="border border-slate-300 p-2 text-center">Qty</th>
                        <th className="border border-slate-300 p-2 text-right">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contract.roofingItems.map(item => (
                        <tr key={item.id}>
                          <td className="border border-slate-300 p-2">{item.description}</td>
                          <td className="border border-slate-300 p-2 text-center">{item.quantity}</td>
                          <td className="border border-slate-300 p-2 text-right">${item.price}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {contract.gutterItems && contract.gutterItems.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">GUTTER SERVICES:</h4>
                  <table className="w-full border border-slate-300 text-xs">
                    <thead className="bg-slate-100">
                      <tr>
                        <th className="border border-slate-300 p-2 text-left">Description</th>
                        <th className="border border-slate-300 p-2 text-center">Qty</th>
                        <th className="border border-slate-300 p-2 text-right">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contract.gutterItems.map(item => (
                        <tr key={item.id}>
                          <td className="border border-slate-300 p-2">{item.description}</td>
                          <td className="border border-slate-300 p-2 text-center">{item.quantity}</td>
                          <td className="border border-slate-300 p-2 text-right">${item.price}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {contract.windowItems && contract.windowItems.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">WINDOW SERVICES:</h4>
                  <table className="w-full border border-slate-300 text-xs">
                    <thead className="bg-slate-100">
                      <tr>
                        <th className="border border-slate-300 p-2 text-left">Description</th>
                        <th className="border border-slate-300 p-2 text-center">Qty</th>
                        <th className="border border-slate-300 p-2 text-right">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contract.windowItems.map(item => (
                        <tr key={item.id}>
                          <td className="border border-slate-300 p-2">{item.description}</td>
                          <td className="border border-slate-300 p-2 text-center">{item.quantity}</td>
                          <td className="border border-slate-300 p-2 text-right">${item.price}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Financial Summary */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold border-b border-slate-300 pb-1 mb-4">FINANCIAL SUMMARY</h3>
              <div className="bg-slate-50 p-4 rounded">
                {contract.subtotal && <p className="flex justify-between"><span>Subtotal:</span><span>${contract.subtotal}</span></p>}
                {contract.deductible && <p className="flex justify-between"><span>Deductible:</span><span>${contract.deductible}</span></p>}
                {contract.upgrades && <p className="flex justify-between"><span>Upgrades:</span><span>{contract.upgrades}</span></p>}
                {contract.discounts && <p className="flex justify-between"><span>Discounts:</span><span>${contract.discounts}</span></p>}
                <div className="border-t border-slate-300 mt-2 pt-2">
                  <p className="flex justify-between text-lg font-bold"><span>GRAND TOTAL:</span><span>${contract.grandTotal}</span></p>
                </div>
              </div>
            </div>

            {/* Payment Schedule */}
            {contract.paymentSchedule && contract.paymentSchedule.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold border-b border-slate-300 pb-1 mb-4">PAYMENT SCHEDULE</h3>
                <table className="w-full border border-slate-300 text-sm">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="border border-slate-300 p-2 text-left">Payment Description</th>
                      <th className="border border-slate-300 p-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contract.paymentSchedule.map(payment => (
                      <tr key={payment.id}>
                        <td className="border border-slate-300 p-2">{payment.description}</td>
                        <td className="border border-slate-300 p-2 text-right">${payment.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Contract Terms Preview */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold border-b border-slate-300 pb-1 mb-4">CONTRACT TERMS</h3>
              <div className="text-xs space-y-2 bg-slate-50 p-4 rounded">
                <p><strong>Work Schedule:</strong> Work will commence upon receipt of signed contract and required payments.</p>
                <p><strong>Materials:</strong> All materials will be new and of good quality, suitable for the purpose intended.</p>
                <p><strong>Warranty:</strong> Work performed is warranted for defects in workmanship.</p>
                <p><strong>Insurance:</strong> Contractor carries appropriate liability and workers compensation insurance.</p>
                <p className="text-center font-semibold mt-4">This is a preview. Full terms and conditions apply.</p>
              </div>
            </div>

            {/* Signature Section */}
            <div className="mt-8 space-y-6">
              <h3 className="text-lg font-semibold border-b border-slate-300 pb-1">SIGNATURES</h3>
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <p className="mb-2"><strong>Customer Signature:</strong></p>
                    <div className="border-b border-slate-400 h-12 flex items-end pb-1">
                      <span className="text-xs text-slate-500">Signature</span>
                    </div>
                  </div>
                  <div>
                    <p className="mb-2"><strong>Print Name:</strong></p>
                    <div className="border-b border-slate-400 h-8 flex items-end pb-1">
                      <span className="text-xs">{contract.customerName || `${firstName} ${lastName}`}</span>
                    </div>
                  </div>
                  <div>
                    <p className="mb-2"><strong>Date:</strong></p>
                    <div className="border-b border-slate-400 h-8 flex items-end pb-1 w-32">
                      <span className="text-xs text-slate-500">Date</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="mb-2"><strong>Company Representative:</strong></p>
                    <div className="border-b border-slate-400 h-12 flex items-end pb-1">
                      <span className="text-xs text-slate-500">Signature</span>
                    </div>
                  </div>
                  <div>
                    <p className="mb-2"><strong>Print Name:</strong></p>
                    <div className="border-b border-slate-400 h-8 flex items-end pb-1">
                      <span className="text-xs">{contract.companyRepresentativeName}</span>
                    </div>
                  </div>
                  <div>
                    <p className="mb-2"><strong>Date:</strong></p>
                    <div className="border-b border-slate-400 h-8 flex items-end pb-1 w-32">
                      <span className="text-xs text-slate-500">Date</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
