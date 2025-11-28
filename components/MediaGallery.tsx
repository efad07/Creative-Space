import React, { useRef, useState } from 'react';
import { Image as ImageIcon, Film, Trash2, UploadCloud, Heart, Download, Edit2, Link as LinkIcon, ExternalLink, X, Eye, Plus } from 'lucide-react';
import { MediaItem } from '../types';

interface MediaGalleryProps {
  items: MediaItem[];
  onAddItems: (newItems: MediaItem[]) => void;
  onUpdateItem: (id: string, updates: Partial<MediaItem>) => void;
  onRemoveItem: (id: string) => void;
  onOpenLightbox: (index: number) => void;
  onShowToast: (message: string, type: 'success' | 'error') => void;
  onToggleLike: (id: string) => void;
}

const MediaGallery: React.FC<MediaGalleryProps> = ({ 
  items, 
  onAddItems, 
  onUpdateItem,
  onRemoveItem, 
  onOpenLightbox,
  onShowToast,
  onToggleLike
}) => {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Edit Modal State
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editLink, setEditLink] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const files = e.target.files;
    processFiles(files, type);
  };

  const processFiles = (files: FileList | null, type: 'image' | 'video') => {
    if (!files || files.length === 0) return;

    const maxSize = type === 'video' ? 200 * 1024 * 1024 : 10 * 1024 * 1024;
    const newItems: MediaItem[] = [];
    const validFiles: File[] = [];

    Array.from(files).forEach((file) => {
      if (file.size > maxSize) {
        onShowToast(`File ${file.name} is too large (max ${type === 'video' ? '200MB' : '10MB'})`, 'error');
        return;
      }
      validFiles.push(file);
    });

    if (validFiles.length === 0) return;

    validFiles.forEach((file) => {
      const objectUrl = URL.createObjectURL(file);
      newItems.push({
        id: Math.random().toString(36).substr(2, 9),
        type,
        url: objectUrl,
        name: file.name,
        likes: 0,
        views: 0,
        likedByUser: false
      });
    });

    if (newItems.length > 0) {
      onAddItems(newItems);
      onShowToast(`${newItems.length} ${type}(s) uploaded successfully`, 'success');
    }

    if (imageInputRef.current) imageInputRef.current.value = '';
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const isVideo = files[0].type.startsWith('video');
      processFiles(files, isVideo ? 'video' : 'image');
    }
  };

  // Editing Handlers
  const startEditing = (item: MediaItem) => {
    setEditingItem(item);
    setEditTitle(item.title || '');
    setEditLink(item.link || '');
  };

  const saveEdit = () => {
    if (editingItem) {
      onUpdateItem(editingItem.id, { title: editTitle, link: editLink });
      setEditingItem(null);
    }
  };

  return (
    <section className="bg-transparent mb-12 relative">
      <div className="mb-10 flex flex-col md:flex-row justify-between items-end border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Latest Work</h2>
          <p className="text-slate-500 font-medium">Explore the visual collection.</p>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
           <button
            onClick={() => imageInputRef.current?.click()}
            className="px-5 py-2.5 bg-violet-50 text-violet-700 hover:bg-violet-100 rounded-full transition-all text-sm font-bold flex items-center gap-2"
          >
            <ImageIcon size={18} />
            <span>Image</span>
          </button>
          <button
            onClick={() => videoInputRef.current?.click()}
            className="px-5 py-2.5 bg-pink-50 text-pink-700 hover:bg-pink-100 rounded-full transition-all text-sm font-bold flex items-center gap-2"
          >
            <Film size={18} />
            <span>Video</span>
          </button>
        </div>
      </div>

      {/* Upload Drop Zone */}
      {isDragging && (
         <div 
          className="fixed inset-0 z-50 bg-violet-500/90 backdrop-blur-sm flex flex-col items-center justify-center m-4 rounded-[2rem] border-4 border-white border-dashed animate-pulse"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <UploadCloud size={80} className="text-white mb-4" />
          <h3 className="text-3xl font-bold text-white">Drop files instantly</h3>
        </div>
      )}

      {items.length === 0 ? (
        <div 
          className="group relative border-2 border-dashed border-slate-300 rounded-[2rem] p-24 text-center hover:border-violet-400 hover:bg-violet-50/50 transition-all cursor-pointer overflow-hidden"
          onClick={() => imageInputRef.current?.click()}
        >
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" 
               style={{ backgroundImage: 'radial-gradient(#8b5cf6 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
          </div>
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-lg mb-6 text-violet-500 group-hover:scale-110 transition-transform duration-300">
               <Plus size={32} strokeWidth={3} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Start your collection</h3>
            <p className="text-slate-500">Upload images or videos to showcase your work.</p>
          </div>
        </div>
      ) : (
        /* Pinterest Masonry Layout */
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {items.map((item, index) => (
            <div key={item.id} className="break-inside-avoid relative group">
              <div 
                className="relative overflow-hidden cursor-zoom-in rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 bg-white"
                onClick={() => onOpenLightbox(index)}
              >
                {/* Media Content */}
                {item.type === 'image' ? (
                  <img
                    src={item.url}
                    alt={item.name}
                    className="w-full h-auto block"
                    loading="lazy"
                  />
                ) : (
                  <div className="relative w-full h-auto">
                    <video
                      src={item.url}
                      className="w-full h-auto block object-cover"
                      muted
                      loop
                      playsInline
                      onMouseOver={(e) => e.currentTarget.play()}
                      onMouseOut={(e) => {
                        e.currentTarget.pause();
                        e.currentTarget.currentTime = 0;
                      }}
                    />
                    <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-md text-white text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-full font-bold pointer-events-none flex items-center gap-1">
                      <Film size={10} /> Video
                    </div>
                  </div>
                )}

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 p-5 flex flex-col justify-between pointer-events-none">
                  {/* Top Section */}
                  <div className="flex justify-between items-start pointer-events-auto translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                     <button
                       onClick={(e) => {
                         e.stopPropagation();
                         startEditing(item);
                       }}
                       className="w-9 h-9 flex items-center justify-center bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-slate-900 transition-all"
                       title="Edit Details"
                     >
                       <Edit2 size={16} />
                     </button>

                     <button 
                       className="bg-violet-600 text-white px-5 py-2 rounded-full font-bold text-xs uppercase tracking-wide hover:bg-violet-500 transition-colors shadow-lg"
                       onClick={(e) => {
                         e.stopPropagation();
                         onShowToast('Saved to collection', 'success');
                       }}
                     >
                       Save
                     </button>
                  </div>

                  {/* Bottom Section */}
                  <div className="flex items-center justify-between w-full pointer-events-auto text-white translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                     <div className="flex gap-4 items-center">
                        <button 
                         className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider transition-colors bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-full
                           ${item.likedByUser 
                             ? 'text-pink-500 bg-pink-500/10' 
                             : 'text-white hover:text-pink-400'}
                         `}
                         onClick={(e) => {
                           e.stopPropagation();
                           onToggleLike(item.id);
                         }}
                       >
                         <Heart size={14} fill={item.likedByUser ? "currentColor" : "none"} />
                         {item.likes > 0 && <span>{item.likes}</span>}
                       </button>

                        <div className="flex items-center gap-1.5 text-xs text-white/80 bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-full">
                          <Eye size={14} />
                          {item.views > 0 && <span>{item.views}</span>}
                        </div>
                     </div>
                     
                     <div className="flex gap-2">
                        {item.link && (
                          <a 
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="w-9 h-9 flex items-center justify-center bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-blue-600 transition-all"
                          >
                             <ExternalLink size={16} />
                          </a>
                        )}
                         <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveItem(item.id);
                          }}
                          className="w-9 h-9 flex items-center justify-center bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-red-500 hover:text-white transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                     </div>
                  </div>
                </div>
              </div>
              
              {/* Title & Link Info */}
              {(item.title || item.link) && (
                <div className="mt-3 px-1">
                  {item.title && (
                    <h4 className="font-bold text-slate-900 text-sm leading-tight mb-1">
                      {item.title}
                    </h4>
                  )}
                  {item.link && (
                    <a 
                      href={item.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-slate-500 hover:text-violet-600 flex items-center gap-1 truncate font-medium transition-colors"
                    >
                      <LinkIcon size={12} />
                      {new URL(item.link).hostname.replace('www.', '')}
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setEditingItem(null)}>
          <div 
            className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl transform scale-100 transition-all border border-white/50" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Edit Media Details</h3>
              <button 
                onClick={() => setEditingItem(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
              >
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Give it a name"
                  className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all outline-none font-medium text-lg placeholder-slate-400"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Destination URL</label>
                <div className="relative">
                  <input
                    type="url"
                    value={editLink}
                    onChange={(e) => setEditLink(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all outline-none font-medium text-slate-600 placeholder-slate-400"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-10">
              <button
                onClick={() => setEditingItem(null)}
                className="flex-1 px-4 py-3 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl transition-colors font-bold"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                className="flex-1 px-4 py-3 gradient-bg text-white hover:opacity-90 rounded-xl transition-all font-bold shadow-lg shadow-violet-500/30"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
      
      <input
        type="file"
        ref={imageInputRef}
        onChange={(e) => handleFileChange(e, 'image')}
        className="hidden"
        accept="image/*"
        multiple
      />
      <input
        type="file"
        ref={videoInputRef}
        onChange={(e) => handleFileChange(e, 'video')}
        className="hidden"
        accept="video/*"
        multiple
      />
    </section>
  );
};

export default MediaGallery;