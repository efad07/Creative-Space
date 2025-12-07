
import React from 'react';
import { X, Heart, Globe, Users } from 'lucide-react';

interface AboutModalProps {
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[2000] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={onClose}>
      <div 
        className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]" 
        onClick={e => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 w-full h-32 bg-slate-900 overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-r from-purple-900 to-indigo-900 opacity-90"></div>
             <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-500/30 rounded-full blur-3xl"></div>
        </div>
        
        <button onClick={onClose} className="absolute top-6 right-6 p-2 text-white/70 hover:text-white transition-colors z-10 rounded-full hover:bg-white/10">
            <X size={24} />
        </button>

        <div className="pt-32 px-8 pb-8 overflow-y-auto">
            <div className="w-20 h-20 bg-white rounded-3xl shadow-xl -mt-14 mb-6 flex items-center justify-center relative z-10">
                <div className="w-12 h-12 bg-gradient-to-tr from-purple-600 to-pink-500 rounded-xl"></div>
            </div>
            
            <h2 className="text-3xl font-black text-slate-900 mb-2">About Creative Space</h2>
            <p className="text-purple-600 font-bold mb-6">Established 2025</p>
            
            <div className="prose prose-slate max-w-none text-slate-600 font-medium">
                <p className="lead text-lg text-slate-800">
                    We are a global community dedicated to visual storytelling. Our platform connects photographers, designers, and artists from every corner of the world.
                </p>
                <p>
                    Creative Space was born from a simple idea: that inspiration should be free and accessible to everyone. What started as a small portfolio project has grown into a vibrant ecosystem where creators can share their work, find inspiration, and connect with like-minded individuals.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-8 not-prose">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                        <Globe className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
                        <h4 className="font-bold text-slate-900">Global</h4>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                        <Users className="w-8 h-8 text-pink-500 mx-auto mb-2" />
                        <h4 className="font-bold text-slate-900">Community</h4>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                        <Heart className="w-8 h-8 text-red-500 mx-auto mb-2" />
                        <h4 className="font-bold text-slate-900">Passion</h4>
                    </div>
                </div>

                <p>
                    Our mission is to empower creators by providing them with the tools they need to showcase their work in the best possible light. We believe in quality over quantity, and in the power of visual media to tell stories that words cannot.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AboutModal;
