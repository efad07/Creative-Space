
import React from 'react';
import { X } from 'lucide-react';

interface TermsModalProps {
  onClose: () => void;
}

const TermsModal: React.FC<TermsModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[2000] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={onClose}>
      <div 
        className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden" 
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white z-10 shrink-0">
          <h2 className="text-2xl font-black text-slate-900">Terms of Service</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-50">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-8 overflow-y-auto prose prose-slate max-w-none">
            <p className="text-sm font-bold text-slate-500 mb-4">Last Updated: December 2025</p>
            
            <h3>1. Introduction</h3>
            <p>Welcome to Creative Space. By accessing our website, you agree to be bound by these Terms of Service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.</p>
            
            <h3>2. User License</h3>
            <p>Permission is granted to temporarily download one copy of the materials (information or software) on Creative Space's website for personal, non-commercial transitory viewing only.</p>
            
            <h3>3. Disclaimer</h3>
            <p>The materials on Creative Space's website are provided on an 'as is' basis. Creative Space makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
            
            <h3>4. Content</h3>
            <p>Our Service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material ("Content"). You are responsible for the Content that you post to the Service, including its legality, reliability, and appropriateness.</p>
            
            <h3>5. Termination</h3>
            <p>We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
            
            <h3>6. Limitation of Liability</h3>
            <p>In no event shall Creative Space or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Creative Space's website.</p>
            
            <h3>7. Governing Law</h3>
            <p>These terms and conditions are governed by and construed in accordance with the laws of Bangladesh and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.</p>
        </div>
      </div>
    </div>
  );
};

export default TermsModal;
