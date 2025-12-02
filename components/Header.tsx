
import React, { useRef, useState } from 'react';
import { Trash2, Upload, Edit2, Check, X, Sparkles } from 'lucide-react';
import { HeaderConfig } from '../types';

interface HeaderProps {
  config: HeaderConfig;
  onUpdatePhoto: (url: string | null) => void;
  onUpdateInfo: (title: string, description: string) => void;
  onShowToast: (message: string, type: 'success' | 'error') => void;
}

const Header: React.FC<HeaderProps> = ({ config, onUpdatePhoto, onUpdateInfo, onShowToast }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(config.title);
  const [editDesc, setEditDesc] = useState(config.description);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      onShowToast('File is too large (max 10MB)', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        onUpdatePhoto(event.target.result);
        onShowToast('Header photo updated successfully', 'success');
      }
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemovePhoto = () => {
    onUpdatePhoto(null);
    onShowToast('Header photo removed', 'success');
  };

  const startEditing = () => {
    setEditTitle(config.title);
    setEditDesc(config.description);
    setIsEditing(true);
  };

  const saveEditing = () => {
    if (!editTitle.trim()) {
      onShowToast('Title cannot be empty', 'error');
      return;
    }
    onUpdateInfo(editTitle, editDesc);
    setIsEditing(false);
    onShowToast('Header info updated successfully', 'success');
  };

  return (
    <header className="relative w-full group pt-28 pb-6 px-4 md:px-6">
      <div className={`relative w-full max-w-[1600px] mx-auto transition-all duration-1000 ${config.photoUrl ? 'h-[500px] md:h-[600px] rounded-[3rem] shadow-2xl overflow-hidden' : 'h-auto bg-transparent'}`}>
        
        {config.photoUrl ? (
          <>
            <div className="absolute inset-0 bg-slate-900/10 z-10 transition-colors duration-500 group-hover:bg-slate-900/20"></div>
            <img 
              src={config.photoUrl} 
              alt="Header" 
              className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-[3s] ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/30 to-transparent flex flex-col items-center justify-end pb-20 p-6 md:p-10 text-center z-20">
               <h1 className="text-6xl md:text-8xl font-black text-white mb-6 drop-shadow-lg tracking-tight">{config.title}</h1>
               <p className="text-xl text-white/90 max-w-2xl font-medium drop-shadow-md">{config.description}</p>
               <button onClick={handleRemovePhoto} className="absolute top-8 right-8 bg-black/30 p-3 rounded-full text-white hover:bg-red-500 transition-colors"><Trash2 size={20} /></button>
            </div>
          </>
        ) : (
          <div className="relative py-20 md:py-32 flex flex-col items-center">
             {isEditing ? (
                <div className="relative z-10 w-full max-w-2xl flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-300 bg-white/80 backdrop-blur-2xl p-10 rounded-[2.5rem] border border-white shadow-2xl">
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full text-center text-4xl md:text-6xl font-black text-slate-800 bg-transparent border-b-2 border-slate-200 p-2 focus:outline-none focus:border-purple-500 transition-all placeholder-slate-300"
                    placeholder="Title"
                    autoFocus
                  />
                  <textarea
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    className="w-full text-center text-xl text-slate-600 bg-transparent border-b-2 border-slate-200 p-2 focus:outline-none focus:border-purple-500 transition-all resize-none font-medium"
                    rows={2}
                    placeholder="Description"
                  />
                  <div className="flex gap-4 mt-4">
                    <button onClick={saveEditing} className="px-8 py-3 bg-purple-600 text-white rounded-full font-bold flex items-center gap-2 hover:bg-purple-700 transition-all shadow-lg"><Check size={18} /> Save Changes</button>
                    <button onClick={() => setIsEditing(false)} className="px-8 py-3 bg-slate-100 text-slate-600 rounded-full font-bold hover:bg-slate-200 transition-all"><X size={18} /> Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="relative z-10 flex flex-col items-center text-center max-w-5xl mx-auto">
                  
                  {/* Floating Icon V2 */}
                  <div className="mb-8 p-4 bg-white/50 backdrop-blur-xl border border-white shadow-2xl shadow-purple-200/50 rounded-2xl animate-float">
                    <Sparkles size={32} className="text-purple-600" />
                  </div>

                  <h1 className="text-7xl md:text-8xl lg:text-[8rem] font-black mb-6 tracking-tighter leading-[0.9] text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-fuchsia-500 to-indigo-600 pb-2 drop-shadow-sm select-none">
                    {config.title}
                  </h1>
                  
                  <p className="text-xl md:text-2xl text-slate-500 max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
                    {config.description}
                  </p>
                  
                  <div className="flex flex-wrap justify-center gap-4">
                    <button
                      onClick={startEditing}
                      className="px-8 py-3.5 bg-white border border-white text-slate-600 hover:text-purple-600 hover:border-purple-100 rounded-full font-bold flex items-center gap-2 transition-all shadow-lg shadow-slate-200/50 hover:shadow-xl active:scale-95"
                    >
                      <Edit2 size={16} />
                      <span>Customize</span>
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-8 py-3.5 bg-slate-900 text-white hover:bg-purple-600 rounded-full font-bold flex items-center gap-2 transition-all shadow-lg hover:shadow-purple-500/30 active:scale-95"
                    >
                      <Upload size={16} />
                      <span>Upload Cover</span>
                    </button>
                  </div>
                </div>
              )}
          </div>
        )}
      </div>

      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
    </header>
  );
};

export default Header;
