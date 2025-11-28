import React, { useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Heart, Eye } from 'lucide-react';
import { MediaItem } from '../types';

interface LightboxProps {
  items: MediaItem[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  onToggleLike?: (id: string) => void;
}

const Lightbox: React.FC<LightboxProps> = ({ 
  items, 
  currentIndex, 
  isOpen, 
  onClose, 
  onNext, 
  onPrev,
  onToggleLike 
}) => {
  const currentItem = items[currentIndex];

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft') onPrev();
    if (e.key === 'ArrowRight') onNext();
  }, [isOpen, onClose, onPrev, onNext]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!isOpen || !currentItem) return null;

  return (
    <div className="fixed inset-0 z-[10000] bg-slate-900/95 backdrop-blur-xl flex items-center justify-center transition-opacity duration-300">
      <button
        onClick={onClose}
        className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full text-white transition-all z-20"
      >
        <X size={24} />
      </button>

      <button
        onClick={onPrev}
        disabled={currentIndex === 0}
        className="absolute left-6 w-14 h-14 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-full text-white disabled:opacity-20 hover:-translate-x-1 transition-all z-20 hidden md:flex"
      >
        <ChevronLeft size={32} />
      </button>

      <button
        onClick={onNext}
        disabled={currentIndex === items.length - 1}
        className="absolute right-6 w-14 h-14 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-full text-white disabled:opacity-20 hover:translate-x-1 transition-all z-20 hidden md:flex"
      >
        <ChevronRight size={32} />
      </button>

      <div className="max-w-[90%] md:max-w-[85%] max-h-[85vh] relative flex flex-col items-center">
        <div className="relative group shadow-2xl rounded-lg overflow-hidden">
          {currentItem.type === 'image' ? (
            <img
              src={currentItem.url}
              alt={currentItem.name}
              className="max-w-full max-h-[70vh] object-contain"
            />
          ) : (
            <video
              src={currentItem.url}
              controls
              autoPlay
              className="max-w-full max-h-[70vh]"
            />
          )}
        </div>

        <div className="mt-8 w-full flex justify-between items-center text-white bg-white/5 px-8 py-4 rounded-2xl backdrop-blur-md border border-white/10">
           <div className="flex flex-col">
             <h3 className="text-xl font-bold tracking-tight">{currentItem.title || "Untitled"}</h3>
             <p className="text-slate-400 font-medium text-xs mt-1">Image {currentIndex + 1} of {items.length}</p>
           </div>
           
           <div className="flex items-center gap-6">
             <button 
               onClick={() => onToggleLike && onToggleLike(currentItem.id)}
               className={`flex items-center gap-2 transition-all px-4 py-2 rounded-full ${currentItem.likedByUser ? 'text-pink-500 bg-pink-500/10' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
             >
               <Heart size={20} fill={currentItem.likedByUser ? "currentColor" : "none"} />
               <span className="text-base font-bold">{currentItem.likes}</span>
             </button>
             
             <div className="flex items-center gap-2 text-slate-400">
               <Eye size={20} />
               <span className="text-base font-bold">{currentItem.views}</span>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Lightbox;