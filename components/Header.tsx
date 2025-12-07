
import React, { useRef, useState } from 'react';
import { Trash2, Upload, Edit2, Check, X, Sparkles, Image as ImageIcon, Palette } from 'lucide-react';
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
  const [isDeleteConfirming, setIsDeleteConfirming] = useState(false);

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

  const handleRemovePhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDeleteConfirming) {
        onUpdatePhoto(null);
        onShowToast('Header photo removed', 'success');
        setIsDeleteConfirming(false);
    } else {
        setIsDeleteConfirming(true);
        // Auto-reset confirmation state after 4 seconds if not clicked
        setTimeout(() => setIsDeleteConfirming(false), 4000);
    }
  };

  const startEditing = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditTitle(config.title);
    setEditDesc(config.description);
    setIsEditing(true);
  };

  const saveEditing = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!editTitle.trim()) {
      onShowToast('Title cannot be empty', 'error');
      return;
    }
    onUpdateInfo(editTitle, editDesc);
    setIsEditing(false);
    onShowToast('Header info updated successfully', 'success');
  };

  const cancelEditing = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(false);
  }

  const triggerFileUpload = (e: React.MouseEvent) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  }

  return (
    <header className="relative w-full group pt-24 pb-12 px-4 md:px-8">
      {/* Main Container */}
      <div 
        className={`
          relative w-full max-w-[1500px] mx-auto transition-all duration-1000 cubic-bezier(0.16, 1, 0.3, 1)
          ${config.photoUrl 
            ? 'h-[500px] md:h-[650px] rounded-[3rem] shadow-2xl shadow-slate-900/20 overflow-hidden ring-1 ring-black/5' 
            : 'h-auto min-h-[400px] flex flex-col items-center justify-center'
          }
        `}
      >
        
        {config.photoUrl ? (
          <>
            {/* Background Image */}
            <div className="absolute inset-0 overflow-hidden bg-slate-900 pointer-events-none">
               <img 
                 src={config.photoUrl} 
                 alt="Cover" 
                 className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-[4s] ease-out will-change-transform opacity-90 animate-fade-in"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent/20 opacity-90"></div>
               <div className="absolute inset-0 bg-black/20"></div>
            </div>

            {/* Content Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-16 md:pb-24 px-6 z-20 text-center max-w-5xl mx-auto pointer-events-none">
               
               {isEditing ? (
                  <div className="w-full bg-black/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/20 animate-in fade-in zoom-in duration-300 pointer-events-auto">
                      <input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full text-center text-4xl md:text-6xl font-black text-white bg-transparent border-b-2 border-white/30 p-2 focus:outline-none focus:border-white transition-all placeholder-white/50 mb-4"
                        placeholder="Title"
                        autoFocus
                      />
                      <textarea
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        className="w-full text-center text-lg md:text-xl text-slate-200 bg-transparent border-b-2 border-white/30 p-2 focus:outline-none focus:border-white transition-all resize-none font-medium"
                        rows={2}
                        placeholder="Description"
                      />
                      <div className="flex gap-4 mt-6 justify-center">
                        <button onClick={saveEditing} className="px-8 py-3 bg-purple-600 text-white rounded-full font-bold flex items-center gap-2 hover:bg-purple-700 transition-all shadow-lg active:scale-95"><Check size={18} /> Save</button>
                        <button onClick={cancelEditing} className="px-8 py-3 bg-white/10 text-white rounded-full font-bold hover:bg-white/20 transition-all backdrop-blur-md active:scale-95"><X size={18} /> Cancel</button>
                      </div>
                  </div>
               ) : (
                 <div className="pointer-events-auto">
                   <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-6 tracking-tight drop-shadow-2xl leading-[0.9] animate-fade-up">
                     {config.title}
                   </h1>
                   <p className="text-lg md:text-2xl text-slate-200 font-medium leading-relaxed max-w-3xl drop-shadow-lg mx-auto animate-fade-up" style={{animationDelay: '0.2s'}}>
                     {config.description}
                   </p>
                 </div>
               )}
            </div>

            {/* Floating Controls (Visible on Hover) - Hidden while editing */}
            {!isEditing && (
              <div className="absolute top-6 right-6 flex flex-wrap justify-end gap-3 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all duration-500 z-[50] translate-y-0 md:translate-y-[-10px] md:group-hover:translate-y-0">
                 <button 
                   onClick={startEditing} 
                   className="px-5 py-3 bg-white/10 backdrop-blur-xl border border-white/20 text-white rounded-full font-bold text-xs md:text-sm hover:bg-white hover:text-slate-900 transition-all flex items-center gap-2 shadow-lg cursor-pointer hover:scale-105 active:scale-95"
                 >
                   <Edit2 size={16} /> <span>Edit Text</span>
                 </button>
                 <button 
                   onClick={triggerFileUpload} 
                   className="px-5 py-3 bg-white/10 backdrop-blur-xl border border-white/20 text-white rounded-full font-bold text-xs md:text-sm hover:bg-white hover:text-slate-900 transition-all flex items-center gap-2 shadow-lg cursor-pointer hover:scale-105 active:scale-95"
                 >
                   <ImageIcon size={16} /> <span>Change Cover</span>
                 </button>
                 <button 
                   onClick={handleRemovePhoto} 
                   className={`p-3 backdrop-blur-xl border border-white/20 text-white rounded-full transition-all shadow-lg cursor-pointer flex items-center gap-2 hover:scale-105 active:scale-95 ${isDeleteConfirming ? 'bg-red-600 hover:bg-red-700 w-auto px-4' : 'bg-red-500/80 hover:bg-red-600'}`}
                   title="Remove Cover"
                 >
                   <Trash2 size={18} />
                   {isDeleteConfirming && <span className="text-xs font-bold animate-in fade-in">Confirm?</span>}
                 </button>
              </div>
            )}
          </>
        ) : (
          /* No Image State */
          <div className="relative w-full flex flex-col items-center text-center z-10 py-20">
             
             {isEditing ? (
                <div className="relative z-10 w-full max-w-3xl flex flex-col items-center gap-8 animate-in fade-in zoom-in duration-300 bg-white/60 backdrop-blur-2xl p-12 rounded-[3rem] border border-white shadow-xl">
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full text-center text-5xl md:text-7xl font-black text-slate-900 bg-transparent border-b-2 border-slate-200 p-4 focus:outline-none focus:border-purple-600 transition-all placeholder-slate-300"
                    placeholder="Title"
                    autoFocus
                  />
                  <textarea
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    className="w-full text-center text-xl md:text-2xl text-slate-600 bg-transparent border-b-2 border-slate-200 p-4 focus:outline-none focus:border-purple-600 transition-all resize-none font-medium"
                    rows={2}
                    placeholder="Short description"
                  />
                  <div className="flex gap-4 mt-6">
                    <button onClick={saveEditing} className="px-10 py-4 bg-purple-600 text-white rounded-full font-bold flex items-center gap-2 hover:bg-purple-700 transition-all shadow-xl hover:scale-105 active:scale-95"><Check size={20} /> Save Changes</button>
                    <button onClick={cancelEditing} className="px-10 py-4 bg-slate-100 text-slate-600 rounded-full font-bold hover:bg-slate-200 transition-all hover:scale-105 active:scale-95"><X size={20} /> Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="relative z-10 flex flex-col items-center text-center max-w-5xl mx-auto">
                  
                  {/* Floating Icon V2 */}
                  <div className="mb-10 p-5 bg-white/60 backdrop-blur-xl border border-white/80 shadow-2xl shadow-purple-200/50 rounded-3xl animate-float">
                    <Sparkles size={40} className="text-purple-600" strokeWidth={1.5} />
                  </div>

                  <h1 className="text-7xl md:text-9xl font-black mb-8 tracking-tighter leading-[0.9] text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-fuchsia-500 to-indigo-600 pb-2 drop-shadow-sm select-none animate-fade-up">
                    {config.title}
                  </h1>
                  
                  <p className="text-xl md:text-3xl text-slate-500 max-w-3xl mx-auto mb-16 font-medium leading-relaxed animate-fade-up" style={{animationDelay: '0.2s'}}>
                    {config.description}
                  </p>
                  
                  <div className="flex flex-wrap justify-center gap-5 animate-fade-up" style={{animationDelay: '0.4s'}}>
                    <button
                      onClick={startEditing}
                      className="group px-10 py-4 bg-white border border-white text-slate-600 hover:text-purple-600 hover:border-purple-100 rounded-full font-bold flex items-center gap-3 transition-all shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:-translate-y-1 active:scale-95 active:translate-y-0"
                    >
                      <Palette size={18} className="group-hover:rotate-12 transition-transform" />
                      <span>Customize</span>
                    </button>
                    <button
                      onClick={triggerFileUpload}
                      className="group px-10 py-4 bg-slate-900 text-white hover:bg-purple-600 rounded-full font-bold flex items-center gap-3 transition-all shadow-xl hover:shadow-purple-500/30 hover:-translate-y-1 active:scale-95 active:translate-y-0"
                    >
                      <Upload size={18} className="group-hover:-translate-y-1 transition-transform" />
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
