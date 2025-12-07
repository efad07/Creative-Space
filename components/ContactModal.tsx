
import React, { useState } from 'react';
import { X, Mail, Send, MapPin } from 'lucide-react';

interface ContactModalProps {
  onClose: () => void;
}

const ContactModal: React.FC<ContactModalProps> = ({ onClose }) => {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => {
        setSent(false);
        onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[2000] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={onClose}>
      <div 
        className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col md:flex-row max-h-[90vh]" 
        onClick={e => e.stopPropagation()}
      >
        {/* Left Side Info */}
        <div className="w-full md:w-5/12 bg-slate-900 p-8 text-white relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="relative z-10">
                <h2 className="text-3xl font-black mb-2">Get in touch</h2>
                <p className="text-slate-400 font-medium">We'd love to hear from you. Fill out the form or reach us via email.</p>
            </div>

            <div className="space-y-6 relative z-10 mt-8 mb-8">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-white/10 rounded-xl">
                        <Mail size={20} className="text-purple-400"/>
                    </div>
                    <div>
                        <h4 className="font-bold">Email</h4>
                        <p className="text-sm text-slate-300">efadsani5540@gmail.com</p>
                    </div>
                </div>
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-white/10 rounded-xl">
                        <MapPin size={20} className="text-pink-400"/>
                    </div>
                    <div>
                        <h4 className="font-bold">Headquarters</h4>
                        <p className="text-sm text-slate-300">Dhaka, Bangladesh</p>
                    </div>
                </div>
            </div>

            <div className="relative z-10">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">© 2025 Creative Space</p>
            </div>
        </div>

        {/* Right Side Form */}
        <div className="flex-1 p-8 md:p-12 relative overflow-y-auto bg-white">
            <button onClick={onClose} className="absolute top-6 right-6 p-2 text-slate-300 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-50">
                <X size={24} />
            </button>

            {sent ? (
                <div className="h-full flex flex-col items-center justify-center text-center animate-in fade-in zoom-in">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-200">
                        <Send size={32} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 mb-2">Message Sent!</h3>
                    <p className="text-slate-500">We'll get back to you as soon as possible.</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6 pt-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Name</label>
                        <input required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:border-purple-500 outline-none font-semibold transition-all" placeholder="Your name" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Email</label>
                        <input required type="email" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:border-purple-500 outline-none font-semibold transition-all" placeholder="you@example.com" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Message</label>
                        <textarea required rows={4} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:border-purple-500 outline-none font-medium transition-all resize-none" placeholder="How can we help?" />
                    </div>
                    <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-purple-600 transition-all shadow-lg shadow-slate-200 active:scale-95 flex items-center justify-center gap-2">
                        Send Message <Send size={18} />
                    </button>
                </form>
            )}
        </div>
      </div>
    </div>
  );
};

export default ContactModal;
