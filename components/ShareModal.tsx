
import React, { useState } from 'react';
import { X, Copy, Check, Twitter, Facebook, Linkedin, Link as LinkIcon, Mail } from 'lucide-react';

interface ShareModalProps {
  url: string;
  title?: string;
  text?: string;
  onClose: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ url, title, onClose }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLinks = [
    {
      name: 'Twitter',
      icon: Twitter,
      color: 'hover:text-sky-500 hover:bg-sky-50',
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title || '')}`
    },
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'hover:text-blue-600 hover:bg-blue-50',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'hover:text-blue-700 hover:bg-blue-50',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
    },
    {
        name: 'Email',
        icon: Mail,
        color: 'hover:text-purple-600 hover:bg-purple-50',
        url: `mailto:?subject=${encodeURIComponent(title || 'Check this out')}&body=${encodeURIComponent(url)}`
    }
  ];

  return (
    <div className="fixed inset-0 z-[2000] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={onClose}>
      <div 
        className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl relative overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
            <h3 className="text-xl font-black text-slate-900">Share Content</h3>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-colors">
                <X size={24} />
            </button>
        </div>

        <div className="p-8">
            <div className="flex gap-4 justify-center mb-8">
                {shareLinks.map((link) => (
                    <a 
                        key={link.name}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 transition-all hover:scale-110 hover:shadow-lg ${link.color}`}
                        title={`Share on ${link.name}`}
                    >
                        <link.icon size={28} />
                    </a>
                ))}
            </div>

            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Page Link</label>
                <div className="flex bg-slate-50 border border-slate-200 rounded-xl overflow-hidden p-1.5 focus-within:ring-2 ring-purple-500/20 transition-all">
                    <div className="pl-3 flex items-center justify-center text-slate-400">
                        <LinkIcon size={18} />
                    </div>
                    <input 
                        readOnly 
                        value={url}
                        className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-600 px-3 truncate outline-none"
                        onClick={(e) => e.currentTarget.select()}
                    />
                    <button 
                        onClick={handleCopy}
                        className={`px-6 py-2.5 rounded-lg font-bold text-xs transition-all flex items-center gap-2 shadow-sm ${copied ? 'bg-green-500 text-white' : 'bg-slate-900 text-white hover:bg-purple-600'}`}
                    >
                        {copied ? <Check size={14} strokeWidth={3} /> : <Copy size={14} strokeWidth={3} />}
                        {copied ? 'Copied' : 'Copy'}
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
