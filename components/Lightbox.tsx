
import React, { useEffect, useCallback, useState } from 'react';
import { X, ChevronLeft, ChevronRight, Heart, Eye, ExternalLink } from 'lucide-react';
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
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Keyboard Navigation
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

  // Touch/Swipe Logic
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentIndex < items.length - 1) {
      onNext();
    }
    if (isRightSwipe && currentIndex > 0) {
      onPrev();
    }
  };

  if (!isOpen || !currentItem) return null;

  return (
    <div 
      className="fixed inset-0 z-[10000] bg-slate-900/95 backdrop-blur-xl flex items-center justify-center transition-opacity duration-300"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <button
        onClick={onClose}
        className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full text-white transition-all z-50 active:scale-90"
      >
        <X size={24} />
      </button>

      {/* Desktop Navigation Buttons */}
      <button
        onClick={(e) => { e.stopPropagation(); onPrev(); }}
        disabled={currentIndex === 0}
        className="absolute left-6 w-14 h-14 items-center justify-center bg-white/5 hover:bg-white/10 rounded-full text-white disabled:opacity-20 hover:-translate-x-1 transition-all z-20 hidden md:flex"
      >
        <ChevronLeft size={32} />
      </button>

      <button
        onClick={(e) => { e.stopPropagation(); onNext(); }}
        disabled={currentIndex === items.length - 1}
        className="absolute right-6 w-14 h-14 items-center justify-center bg-white/5 hover:bg-white/10 rounded-full text-white disabled:opacity-20 hover:translate-x-1 transition-all z-20 hidden md:flex"
      >
        <ChevronRight size={32} />
      </button>

      {/* Mobile Swipe Hint */}
      <div className="absolute bottom-24 left-0 right-0 text-center text-white/30 text-xs font-medium md:hidden pointer-events-none animate-pulse">
        Swipe left or right to navigate
      </div>

      <div className="max-w-[95%] md:max-w-[85%] max-h-[85vh] relative flex flex-col items-center">
        <div className="relative group shadow-2xl rounded-lg overflow-hidden bg-black">
          {currentItem.type === 'image' ? (
            <img
              src={currentItem.url}
              alt={currentItem.name}
              className="max-w-full max-h-[70vh] object-contain select-none"
              draggable={false}
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

        <div className="mt-6 w-full flex flex-col md:flex-row justify-between items-start md:items-center text-white bg-white/5 px-6 py-4 rounded-2xl backdrop-blur-md border border-white/10 gap-4">
           <div className="flex flex-col flex-1 min-w-0">
             <div className="flex items-center gap-3">
               <h3 className="text-lg md:text-xl font-bold tracking-tight truncate">{currentItem.title || "Untitled"}</h3>
               {currentItem.link && (
                 <a 
                   href={currentItem.link} 
                   target="_blank" 
                   rel="noopener noreferrer" 
                   className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500 hover:text-white rounded-full text-xs font-bold transition-all uppercase tracking-wider"
                   onClick={(e) => e.stopPropagation()}
                 >
                   Visit Link <ExternalLink size={10} />
                 </a>
               )}
             </div>
             <p className="text-slate-400 font-medium text-xs mt-1">Image {currentIndex + 1} of {items.length}</p>
           </div>
           
           <div className="flex items-center gap-4 self-end md:self-auto">
             {currentItem.link && (
                <a 
                  href={currentItem.link} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="md:hidden flex items-center justify-center w-10 h-10 bg-indigo-500 text-white rounded-full shadow-lg shadow-indigo-500/30"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink size={18} />
                </a>
             )}
             
             <button 
               onClick={(e) => { e.stopPropagation(); onToggleLike && onToggleLike(currentItem.id); }}
               className={`flex items-center gap-2 transition-all px-4 py-2 rounded-full active:scale-95 ${currentItem.likedByUser ? 'text-pink-500 bg-pink-500/10' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
             >
               <Heart size={20} fill={currentItem.likedByUser ? "currentColor" : "none"} />
               <span className="text-base font-bold">{currentItem.likes}</span>
             </button>
             
             <div className="flex items-center gap-2 text-slate-400 px-2">
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
