import React, { useRef, useState } from 'react';
import { Camera, Trash2, Upload, Edit2, Check, X, Sparkles } from 'lucide-react';
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

  const cancelEditing = () => {
    setIsEditing(false);
  };

  return (
    <header className="relative w-full group pt-24 pb-8 px-4 md:px-0">
      <div className={`relative w-full max-w-[1600px] mx-auto overflow-hidden transition-all duration-500 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 ${config.photoUrl ? 'h-[500px]' : 'h-auto bg-white border border-slate-100'}`}>
        {config.photoUrl ? (
          <>
            <img 
              src={config.photoUrl} 
              alt="Header" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col items-center justify-center p-10 text-center">
              {isEditing ? (
                <div className="w-full max-w-3xl flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-300 bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20">
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full text-center text-5xl md:text-7xl font-bold text-white bg-transparent border-b-2 border-white/30 p-4 focus:outline-none focus:border-white transition-all placeholder-white/50"
                    placeholder="Enter blog title..."
                  />
                  <textarea
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    className="w-full text-center text-xl text-white/90 bg-transparent border-b-2 border-white/30 p-3 focus:outline-none focus:border-white transition-all placeholder-white/50 resize-none font-light"
                    rows={2}
                    placeholder="Enter description..."
                  />
                  <div className="flex gap-4 mt-6">
                    <button 
                      onClick={saveEditing} 
                      className="px-8 py-3 bg-white text-violet-600 hover:bg-gray-50 rounded-full font-bold flex items-center gap-2 transition-all shadow-lg"
                    >
                      <Check size={18} /> Save
                    </button>
                    <button 
                      onClick={cancelEditing} 
                      className="px-8 py-3 bg-white/20 backdrop-blur-md text-white hover:bg-white/30 rounded-full font-bold flex items-center gap-2 transition-all"
                    >
                      <X size={18} /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-4 tracking-tight drop-shadow-lg">
                    {config.title}
                  </h1>
                  <p className="text-lg md:text-xl text-white/90 max-w-2xl font-medium tracking-wide drop-shadow-md">
                    {config.description}
                  </p>
                  
                  <div className="mt-10 flex flex-wrap justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                      onClick={startEditing}
                      className="px-6 py-3 bg-white/90 backdrop-blur text-slate-900 hover:bg-white rounded-full font-semibold flex items-center gap-2 transition-all shadow-lg hover:scale-105 active:scale-95"
                    >
                      <Edit2 size={16} />
                      <span>Edit Info</span>
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-6 py-3 bg-white/20 backdrop-blur text-white hover:bg-white/30 rounded-full font-semibold flex items-center gap-2 transition-all border border-white/40 hover:scale-105 active:scale-95"
                    >
                      <Camera size={16} />
                      <span>Change Photo</span>
                    </button>
                  </div>

                  <button
                    onClick={handleRemovePhoto}
                    className="absolute top-6 right-6 w-10 h-10 bg-white/10 backdrop-blur text-white hover:bg-red-500 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 border border-white/20"
                    title="Remove photo"
                  >
                    <Trash2 size={16} />
                  </button>
                </>
              )}
            </div>
          </>
        ) : (
          <div className="relative py-32 px-8 flex flex-col items-center overflow-hidden">
             {/* Decorative Background Elements */}
             <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none" 
                  style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
             </div>
             <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-purple-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-20 animate-blob"></div>
             <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-pink-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-20 animate-blob animation-delay-2000"></div>

             {isEditing ? (
                <div className="relative z-10 w-full max-w-3xl flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-300 bg-white/50 backdrop-blur-xl p-10 rounded-3xl border border-white shadow-xl">
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full text-center text-4xl md:text-6xl font-black text-slate-900 bg-transparent border-b-2 border-slate-200 p-4 focus:outline-none focus:border-violet-500 transition-all placeholder-slate-300"
                    placeholder="Enter blog title..."
                  />
                  <textarea
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    className="w-full text-center text-xl text-slate-600 bg-transparent border-b-2 border-slate-200 p-3 focus:outline-none focus:border-violet-500 transition-all placeholder-slate-300 resize-none"
                    rows={2}
                    placeholder="Enter description..."
                  />
                  <div className="flex gap-4 mt-6">
                    <button 
                      onClick={saveEditing} 
                      className="px-8 py-3 gradient-bg text-white hover:opacity-90 rounded-full font-bold flex items-center gap-2 transition-all shadow-lg shadow-violet-500/30"
                    >
                      <Check size={18} /> Save Changes
                    </button>
                    <button 
                      onClick={cancelEditing} 
                      className="px-8 py-3 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-full font-bold flex items-center gap-2 transition-all"
                    >
                      <X size={18} /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="relative z-10 flex flex-col items-center">
                  <div className="mb-6 p-3 bg-gradient-to-br from-violet-100 to-fuchsia-50 rounded-2xl rotate-3 shadow-lg">
                    <Sparkles className="text-violet-600 w-8 h-8" />
                  </div>
                  <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tight text-slate-900 text-center">
                    <span className="gradient-text">{config.title}</span>
                  </h1>
                  <p className="text-xl md:text-2xl text-slate-500 max-w-2xl mx-auto mb-10 font-medium tracking-tight text-center">
                    {config.description}
                  </p>
                  
                  <div className="flex flex-wrap justify-center gap-4">
                    <button
                      onClick={startEditing}
                      className="px-8 py-4 bg-white border border-slate-200 text-slate-700 hover:border-violet-300 hover:text-violet-600 rounded-full font-bold flex items-center gap-2 transition-all shadow-sm hover:shadow-md active:scale-95"
                    >
                      <Edit2 size={16} />
                      <span>Edit Info</span>
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-8 py-4 gradient-bg text-white hover:opacity-90 rounded-full font-bold flex items-center gap-2 transition-all shadow-xl shadow-violet-500/20 hover:shadow-violet-500/40 active:scale-95"
                    >
                      <Upload size={16} />
                      <span>Add Header Photo</span>
                    </button>
                  </div>
                </div>
              )}
          </div>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />
    </header>
  );
};

export default Header;