import React, { useRef, useState } from 'react';
import SignatureCanvas, { SignatureCanvasRef } from './SignatureCanvas';

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (signatureData: string, date: string) => void;
  title: string;
  description?: string;
}

const SignatureModal: React.FC<SignatureModalProps> = ({
  isOpen,
  onClose,
  onSave,
  title,
  description
}) => {
  const signatureRef = useRef<SignatureCanvasRef>(null);
  const [hasSignature, setHasSignature] = useState(false);

  if (!isOpen) return null;

  const handleClear = () => {
    signatureRef.current?.clear();
    setHasSignature(false);
  };

  const handleSave = () => {
    if (!signatureRef.current || signatureRef.current.isEmpty()) {
      alert('Please provide a signature before saving.');
      return;
    }

    const signatureData = signatureRef.current.toDataURL();
    const currentDate = new Date().toLocaleDateString();
    onSave(signatureData, currentDate);
    onClose();
  };

  const handleSignatureChange = (isEmpty: boolean) => {
    setHasSignature(!isEmpty);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
          <button 
            onClick={onClose} 
            className="text-slate-500 hover:text-slate-700 text-2xl" 
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>
        
        <div className="p-6">
          {description && (
            <p className="text-sm text-slate-600 mb-4">{description}</p>
          )}
          
          <div className="flex flex-col items-center space-y-4">
            <SignatureCanvas
              ref={signatureRef}
              width={400}
              height={150}
              onSignatureChange={handleSignatureChange}
              className="rounded border-2 border-slate-300"
            />
            
            <p className="text-xs text-slate-500 text-center">
              Sign above using your mouse or finger
            </p>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 p-6 bg-slate-50 border-t border-slate-200">
          <button
            type="button"
            onClick={handleClear}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!hasSignature}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Signature
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignatureModal;