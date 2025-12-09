
import React, { useRef, useState } from 'react';
import { Image as ImageIcon, Film, Trash2, Heart, Bookmark, Loader2, Plus, Layers, Edit2, Link as LinkIcon, Check, X, MessageCircle, Share2 } from 'lucide-react';
import { MediaItem, User as UserType } from '../types';

interface MediaGalleryProps {
  items: MediaItem[];
  onAddItems: (newItems: MediaItem[]) => void;
  onUpdateItem: (id: string, updates: Partial<MediaItem>) => void;
  onRemoveItem: (id: string) => void;
  onOpenLightbox: (index: number) => void;
  onShowToast: (message: string, type: 'success' | 'error') => void;
  onToggleLike: (id: string) => void;
  onClearAll: () => void;
  onSaveItem: (item: MediaItem) => void;
  onAddComment?: (id: string, text: string) => void;
  onShare?: (item: MediaItem) => void;
  currentUser: UserType | null;
  allowUpload?: boolean;
  viewMode: 'grid' | 'list';
}

const MediaGallery: React.FC<MediaGalleryProps> = ({ 
  items, onAddItems, onUpdateItem, onRemoveItem, onOpenLightbox, onShowToast, onToggleLike, onClearAll, onSaveItem, onShare, currentUser, allowUpload = false, viewMode
}) => {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  // Delete Confirmation State
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isClearingConfirm, setIsClearingConfirm] = useState(false);

  // Edit State
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [editForm, setEditForm] = useState({ title: '', link: '', category: 'Photography' });

  const processFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const newItems: MediaItem[] = [];
    Array.from(fileList).forEach((file) => {
      const type = file.type.startsWith('video') ? 'video' : 'image';
      // Remove extension for default title
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
      newItems.push({
        id: Math.random().toString(36).substr(2, 9),
        type,
        url: URL.createObjectURL(file),
        name: file.name,
        title: nameWithoutExt.charAt(0).toUpperCase() + nameWithoutExt.slice(1).replace(/[-_]/g, ' '),
        category: 'Photography', // Default category for uploads
        likes: 0,
        views: 0,
        likedByUser: false,
        comments: []
      });
    });

    if (newItems.length > 0) {
      onAddItems(newItems);
      onShowToast(`Uploaded ${newItems.length} item${newItems.length > 1 ? 's' : ''} successfully`, 'success');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
    e.target.value = '';
  };

  const handleSaveClick = async (e: React.MouseEvent, item: MediaItem) => {
    e.stopPropagation();
    if (savingId) return;
    setSavingId(item.id);
    try {
      await onSaveItem(item);
    } finally {
      setSavingId(null);
    }
  };

  const startEditing = (e: React.MouseEvent, item: MediaItem) => {
    e.stopPropagation();
    setEditingItem(item);
    setEditForm({
      title: item.title || item.name || '',
      link: item.link || '',
      category: item.category || 'Photography'
    });
  };

  const saveEdit = () => {
    if (editingItem) {
      onUpdateItem(editingItem.id, {
        title: editForm.title,
        link: editForm.link,
        category: editForm.category
      });
      setEditingItem(null);
      onShowToast('Item details updated', 'success');
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (deleteConfirmId === id) {
        onRemoveItem(id);
        setDeleteConfirmId(null);
    } else {
        setDeleteConfirmId(id);
        setTimeout(() => setDeleteConfirmId(null), 3000); // Auto reset
    }
  };

  const handleClearClick = () => {
    if (isClearingConfirm) {
        onClearAll();
        setIsClearingConfirm(false);
    } else {
        setIsClearingConfirm(true);
        setTimeout(() => setIsClearingConfirm(false), 3000);
    }
  };

  return (
    <>
      <div className={`min-h-[400px] transition-all duration-300 rounded-[2.5rem] ${isDragging ? 'bg-indigo-50 border-2 border-dashed border-indigo-400 scale-[1.01]' : ''}`}
          onDragOver={e => {e.preventDefault(); setIsDragging(true)}}
          onDragLeave={e => {e.preventDefault(); setIsDragging(false)}}
          onDrop={e => {
              e.preventDefault(); 
              setIsDragging(false);
              if(allowUpload) processFiles(e.dataTransfer.files);
          }}
      >
        <input ref={imageInputRef} type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
        <input ref={videoInputRef} type="file" multiple accept="video/*" className="hidden" onChange={handleFileChange} />

        {/* Toolbar */}
        {allowUpload && items.length > 0 && (
          <div className="mb-8 glass-panel rounded-[2rem] p-4 flex flex-wrap gap-4 items-center justify-between animate-fade-up shadow-sm">
            <div className="flex items-center gap-3 pl-2">
              <div className="p-2 bg-slate-100 rounded-full text-slate-500"><Layers size={18} /></div>
              <h3 className="font-bold text-lg text-slate-800">Manage Gallery</h3>
            </div>
            <div className="flex gap-2">
              <button onClick={() => imageInputRef.current?.click()} className="px-5 py-2.5 bg-slate-900 text-white rounded-full font-bold text-xs flex gap-2 items-center hover:bg-slate-800 transition-all hover:-translate-y-0.5 shadow-lg shadow-slate-200 active:scale-95"><ImageIcon size={14}/> Photos</button>
              <button onClick={() => videoInputRef.current?.click()} className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-full font-bold text-xs flex gap-2 items-center hover:bg-slate-50 transition-all hover:-translate-y-0.5 active:scale-95"><Film size={14}/> Video</button>
              <button 
                onClick={handleClearClick} 
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full transition-all ml-2 text-xs font-bold active:scale-95 ${isClearingConfirm ? 'bg-red-600 text-white shadow-lg shadow-red-200' : 'text-slate-400 hover:text-red-500 hover:bg-red-50'}`}
              >
                 {isClearingConfirm ? <><Check size={16}/> Confirm</> : <Trash2 size={18}/>}
              </button>
            </div>
          </div>
        )}

        {items.length === 0 ? (
          allowUpload ? (
              <div 
                  className="w-full h-[400px] border-3 border-dashed border-slate-200 hover:border-purple-400 rounded-[2.5rem] flex flex-col items-center justify-center text-center hover:bg-purple-50/10 transition-all cursor-pointer group bg-white/40 backdrop-blur-sm animate-fade-up"
                  onClick={() => imageInputRef.current?.click()}
              >
                  <div className="w-24 h-24 bg-white rounded-full shadow-2xl flex items-center justify-center text-purple-600 mb-6 group-hover:scale-110 transition-transform duration-300 group-hover:text-purple-500 group-hover:shadow-purple-200">
                      <Plus size={48} strokeWidth={3} />
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Start your collection</h3>
                  <p className="text-slate-500 font-medium max-w-md mx-auto leading-relaxed">
                      Drag and drop your visual masterpieces here<br/>to begin building your gallery.
                  </p>
              </div>
          ) : (
              <div className="text-center py-32 opacity-60 animate-fade-in">
                <div className="w-24 h-24 bg-slate-100/50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300"><ImageIcon size={48}/></div>
                <h3 className="text-2xl font-bold text-slate-900">No items found</h3>
                <p className="text-slate-500 mt-2">Adjust your filters or search terms.</p>
              </div>
          )
        ) : (
          /* Content Grid/List */
          <div className={viewMode === 'grid' ? "columns-1 sm:columns-2 lg:columns-3 gap-8 space-y-8" : "flex flex-col gap-6"}>
              {items.map((item, idx) => (
                <div key={item.id} 
                      className={`break-inside-avoid relative group rounded-[2rem] overflow-hidden bg-white shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-500 cursor-pointer border border-white/50 opacity-0 animate-fade-up ${viewMode === 'list' ? 'flex h-64 hover:-translate-y-1' : 'hover:-translate-y-2 hover:rotate-1'}`}
                      style={{ animationDelay: `${idx * 100}ms` }}
                      onClick={() => onOpenLightbox(idx)}
                >
                    {/* Media Display */}
                    <div className={`relative bg-slate-100 overflow-hidden ${viewMode === 'list' ? 'w-1/3 h-full' : 'w-full'}`}>
                      {item.type === 'image' ? (
                        <img 
                          src={item.url} 
                          alt={item.name} 
                          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000 ease-out"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-900 flex items-center justify-center group-hover:scale-110 transition-transform duration-1000 ease-out">
                          <video src={item.url} className="w-full h-full object-cover opacity-80" muted loop onMouseOver={e => e.currentTarget.play()} onMouseOut={e => e.currentTarget.pause()} />
                          <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/50 animate-pulse">
                                  <Film size={20} />
                              </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Grid View Overlay with Author Info */}
                      {viewMode === 'grid' && (
                          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1) flex flex-col justify-end h-full">
                               <div className="flex items-center gap-2 mb-3">
                                   <div className="w-8 h-8 rounded-full border border-white/50 overflow-hidden bg-white/20 backdrop-blur-sm shrink-0">
                                       {item.authorAvatar ? (
                                           <img src={item.authorAvatar} alt={item.authorName} className="w-full h-full object-cover" />
                                       ) : (
                                           <div className="w-full h-full flex items-center justify-center text-white text-[10px] font-bold bg-slate-500">
                                               {item.authorName?.charAt(0)}
                                           </div>
                                       )}
                                   </div>
                                   <span className="text-white text-xs font-bold truncate shadow-sm">{item.authorName}</span>
                               </div>
                               
                               <div className="flex justify-between items-end">
                                  <div>
                                      {item.category && <span className="text-[10px] font-bold text-white/80 bg-white/10 px-2 py-1 rounded-md backdrop-blur-sm mb-2 inline-block">{item.category}</span>}
                                      <h3 className="text-white font-bold text-lg leading-tight drop-shadow-md truncate w-48">{item.title || item.name}</h3>
                                  </div>
                                  <div className="flex gap-2">
                                    <button onClick={(e) => { e.stopPropagation(); onToggleLike(item.id); }} className={`p-2 rounded-full backdrop-blur-md transition-all active:scale-75 duration-300 ${item.likedByUser ? 'bg-pink-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                                        <Heart size={18} fill={item.likedByUser ? "currentColor" : "none"} />
                                    </button>
                                  </div>
                               </div>
                               
                               {/* Hover Stats */}
                               <div className="flex gap-4 mt-3 pt-3 border-t border-white/10">
                                  <div className="flex items-center gap-1.5 text-white/80 text-xs font-bold">
                                     <Heart size={14}/> {item.likes}
                                  </div>
                                  <div className="flex items-center gap-1.5 text-white/80 text-xs font-bold">
                                     <MessageCircle size={14}/> {item.comments?.length || 0}
                                  </div>
                               </div>
                          </div>
                      )}
                    </div>

                    {/* List View Content */}
                    {viewMode === 'list' && (
                        <div className="flex-1 p-8 flex flex-col justify-center">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden">
                                           {item.authorAvatar ? (
                                             <img src={item.authorAvatar} alt={item.authorName} className="w-full h-full object-cover"/>
                                           ) : (
                                             <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-500">{item.authorName?.charAt(0)}</div>
                                           )}
                                        </div>
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{item.authorName}</span>
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 mb-1">{item.title || item.name}</h3>
                                    {item.category && <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-md">{item.category}</span>}
                                </div>
                                <div className="flex gap-2">
                                   {allowUpload && (
                                      <button onClick={(e) => startEditing(e, item)} className="p-2 text-slate-400 hover:text-purple-600 transition-colors hover:rotate-12"><Edit2 size={18} /></button>
                                   )}
                                   {allowUpload && (
                                       <button 
                                          onClick={(e) => handleDeleteClick(e, item.id)} 
                                          className={`p-2 transition-all rounded-full active:scale-90 ${deleteConfirmId === item.id ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400 hover:text-red-500'}`}
                                        >
                                          {deleteConfirmId === item.id ? <Check size={18} /> : <Trash2 size={18}/>}
                                        </button>
                                   )}
                                </div>
                            </div>
                            
                            <div className="mt-auto flex items-center gap-6">
                                <button onClick={(e) => { e.stopPropagation(); onToggleLike(item.id); }} className={`flex items-center gap-2 font-bold transition-all active:scale-90 ${item.likedByUser ? 'text-pink-500' : 'text-slate-400 hover:text-slate-600'}`}>
                                    <Heart size={20} fill={item.likedByUser ? "currentColor" : "none"} /> {item.likes}
                                </button>
                                <button className="flex items-center gap-2 font-bold text-slate-400 hover:text-slate-600 transition-colors">
                                    <MessageCircle size={20} /> {item.comments?.length || 0}
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); onShare && onShare(item); }} className="flex items-center gap-2 font-bold text-slate-400 hover:text-slate-600 transition-colors">
                                    <Share2 size={20} />
                                </button>

                                {(!currentUser || item.userId !== currentUser.email) && (
                                    <button onClick={(e) => handleSaveClick(e, item)} className="ml-auto flex items-center gap-2 font-bold text-slate-400 hover:text-purple-600 transition-colors active:scale-90">
                                        {savingId === item.id ? <Loader2 size={20} className="animate-spin"/> : <Bookmark size={20} />} Save
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                    
                    {/* Grid View Hover Actions (Edit/Delete + Share) */}
                    {viewMode === 'grid' && (
                        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                             <button 
                                onClick={(e) => { e.stopPropagation(); onShare && onShare(item); }}
                                className="p-2 bg-white/90 backdrop-blur-md rounded-full text-slate-600 hover:text-indigo-600 shadow-sm hover:scale-110 active:scale-90 transition-transform"
                             >
                                <Share2 size={14} />
                             </button>
                             {allowUpload && (
                                <>
                                 <button onClick={(e) => startEditing(e, item)} className="p-2 bg-white/90 backdrop-blur-md rounded-full text-slate-600 hover:text-purple-600 shadow-sm hover:scale-110 active:scale-90 transition-transform"><Edit2 size={14}/></button>
                                 <button 
                                    onClick={(e) => handleDeleteClick(e, item.id)} 
                                    className={`p-2 backdrop-blur-md rounded-full shadow-sm transition-all hover:scale-110 active:scale-90 ${deleteConfirmId === item.id ? 'bg-red-600 text-white' : 'bg-white/90 text-slate-600 hover:text-red-600'}`}
                                 >
                                   {deleteConfirmId === item.id ? <Check size={14}/> : <Trash2 size={14}/>}
                                 </button>
                                </>
                             )}
                        </div>
                    )}
                    
                    {/* Grid View Save (For non-owners) */}
                    {viewMode === 'grid' && (!currentUser || item.userId !== currentUser.email) && (
                       <button 
                          onClick={(e) => handleSaveClick(e, item)}
                          className="absolute top-3 left-3 p-2.5 bg-black/20 backdrop-blur-md border border-white/30 rounded-full text-white hover:bg-white hover:text-purple-600 transition-all opacity-0 group-hover:opacity-100 duration-300 hover:scale-110 active:scale-90"
                        >
                          {savingId === item.id ? <Loader2 size={16} className="animate-spin"/> : <Bookmark size={16} />}
                       </button>
                    )}
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setEditingItem(null)}>
           <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-300" onClick={e => e.stopPropagation()}>
               <h3 className="text-2xl font-black text-slate-900 mb-6">Edit Details</h3>
               
               <div className="space-y-4">
                   <div>
                       <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1 mb-1 block">Title</label>
                       <input 
                          value={editForm.title}
                          onChange={e => setEditForm(p => ({...p, title: e.target.value}))}
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-purple-500 outline-none font-semibold focus:ring-4 focus:ring-purple-500/10 transition-all"
                       />
                   </div>
                   
                   <div>
                       <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1 mb-1 block">Category</label>
                       <select 
                          value={editForm.category}
                          onChange={e => setEditForm(p => ({...p, category: e.target.value}))}
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-purple-500 outline-none font-semibold focus:ring-4 focus:ring-purple-500/10 transition-all"
                       >
                           {['Photography', 'Art', 'Design', 'Tech', 'Lifestyle'].map(c => <option key={c} value={c}>{c}</option>)}
                       </select>
                   </div>

                   <div>
                       <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1 mb-1 block">External Link (Optional)</label>
                       <div className="relative">
                           <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                           <input 
                              value={editForm.link}
                              onChange={e => setEditForm(p => ({...p, link: e.target.value}))}
                              placeholder="https://..."
                              className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-purple-500 outline-none font-medium text-sm focus:ring-4 focus:ring-purple-500/10 transition-all"
                           />
                       </div>
                   </div>
               </div>

               <div className="flex gap-3 mt-8">
                   <button onClick={saveEdit} className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-purple-600 transition-colors flex items-center justify-center gap-2 active:scale-95"><Check size={18}/> Save</button>
                   <button onClick={() => setEditingItem(null)} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 active:scale-95"><X size={18}/> Cancel</button>
               </div>
           </div>
        </div>
      )}
    </>
  );
};

export default MediaGallery;
