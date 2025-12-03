
import React, { useEffect, useState } from 'react';
import { X, Heart, MoreHorizontal, ArrowUp, Link as LinkIcon, Edit2, Trash2, Check, AlertTriangle } from 'lucide-react';
import { BlogPostData, User } from '../types';

interface StoryViewerProps {
  stories: BlogPostData[];
  initialIndex: number;
  onClose: () => void;
  onReadMore: (story: BlogPostData) => void;
  currentUser?: User | null;
  onDelete?: (id: string) => void;
  onUpdate?: (id: string, updates: Partial<BlogPostData>) => void;
}

const StoryViewer: React.FC<StoryViewerProps> = ({ stories, initialIndex, onClose, onReadMore, currentUser, onDelete, onUpdate }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [isDeleteConfirming, setIsDeleteConfirming] = useState(false);
  
  const currentStory = stories[currentIndex];
  // Guard against empty stories if deleted while viewing
  if (!currentStory) {
      setTimeout(onClose, 0);
      return null;
  }

  const DURATION = 5000; // 5 seconds per story
  const isOwner = currentUser && currentStory.userId === currentUser.email;

  useEffect(() => {
    setProgress(0);
    setShowMenu(false);
    setIsEditing(false);
    setIsDeleteConfirming(false);
  }, [currentIndex]);

  useEffect(() => {
    if (isPaused || isEditing || showMenu) return;

    const startTime = Date.now();
    const startProgress = progress;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = startProgress + (elapsed / DURATION) * 100;

      if (newProgress >= 100) {
        handleNext();
      } else {
        setProgress(newProgress);
      }
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, [currentIndex, isPaused, isEditing, showMenu]);

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (progress > 10) {
        setProgress(0);
    } else if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleteConfirming(true);
  };

  const handleConfirmDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete && onDelete(currentStory.id);
    onClose();
  };

  const handleStartEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditTitle(currentStory.title);
    setIsEditing(true);
    setShowMenu(false);
    setIsPaused(true);
  }

  const handleSaveEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdate && onUpdate(currentStory.id, { title: editTitle });
    setIsEditing(false);
    setIsPaused(false);
  }

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(false);
    setIsPaused(false);
  }

  return (
    <div className="fixed inset-0 z-[2000] bg-black flex items-center justify-center">
      {/* Blurred Backdrop */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30 blur-3xl scale-110"
        style={{ backgroundImage: `url(${currentStory.imageUrl})` }}
      />
      
      <div className="relative w-full h-full md:w-[450px] md:h-[90vh] md:rounded-3xl bg-slate-900 overflow-hidden shadow-2xl flex flex-col">
        {/* Progress Bars */}
        <div className="absolute top-0 left-0 right-0 z-20 p-2 flex gap-1">
          {stories.map((story, idx) => (
            <div key={story.id} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-100 ease-linear"
                style={{ 
                    width: idx < currentIndex ? '100%' : idx === currentIndex ? `${progress}%` : '0%' 
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-4 left-0 right-0 z-50 px-4 pt-2 flex justify-between items-center text-white pointer-events-none">
            <div className="flex items-center gap-3 pointer-events-auto">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-fuchsia-600 p-[2px]">
                   <div className="w-full h-full rounded-full bg-slate-900 border border-black overflow-hidden relative">
                       {currentStory.authorAvatar ? (
                         <img src={currentStory.authorAvatar} alt={currentStory.author} className="w-full h-full object-cover" />
                       ) : (
                         <div className="w-full h-full bg-slate-500 flex items-center justify-center text-[10px] font-bold">
                           {currentStory.author.charAt(0)}
                         </div>
                       )}
                   </div>
                </div>
                <div>
                    <span className="text-sm font-bold shadow-sm">{currentStory.author}</span>
                    <span className="text-xs text-white/60 ml-2">{currentStory.date}</span>
                </div>
            </div>
            <div className="flex items-center gap-2 relative pointer-events-auto">
                {isOwner && (
                    <div className="relative">
                        <button onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); setIsPaused(true); setIsDeleteConfirming(false); }} className="p-2 hover:bg-white/10 rounded-full transition-colors"><MoreHorizontal size={20}/></button>
                        {showMenu && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setShowMenu(false); setIsPaused(false); }}></div>
                                <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-xl overflow-hidden min-w-[160px] py-1 animate-in fade-in zoom-in duration-200 z-50 border border-slate-100">
                                    <button onClick={handleStartEdit} className="w-full px-4 py-3 text-left text-sm font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                        <Edit2 size={16}/> Edit Caption
                                    </button>
                                    
                                    {isDeleteConfirming ? (
                                        <button onClick={handleConfirmDelete} className="w-full px-4 py-3 text-left text-sm font-bold text-white bg-red-600 hover:bg-red-700 flex items-center gap-2 border-t border-slate-100 animate-in fade-in">
                                            <AlertTriangle size={16}/> Confirm Delete?
                                        </button>
                                    ) : (
                                        <button onClick={handleDeleteClick} className="w-full px-4 py-3 text-left text-sm font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-slate-100">
                                            <Trash2 size={16}/> Delete Story
                                        </button>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                )}
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={24}/></button>
            </div>
        </div>

        {/* Main Content Area */}
        <div 
            className="flex-1 relative cursor-pointer"
            onMouseDown={() => !isEditing && setIsPaused(true)}
            onMouseUp={() => !isEditing && setIsPaused(false)}
            onTouchStart={() => !isEditing && setIsPaused(true)}
            onTouchEnd={() => !isEditing && setIsPaused(false)}
        >
            <img 
                src={currentStory.imageUrl} 
                className="w-full h-full object-cover"
                alt="Story"
            />
            
            {/* Gradient Overlay for Text */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/90 pointer-events-none"></div>

            {/* Story Text / Edit Interface - High Z-Index to sit above nav zones */}
            <div className={`absolute bottom-24 left-0 right-0 p-6 text-white ${isEditing ? 'z-50 pointer-events-auto' : 'z-20 pointer-events-none'}`}>
                 {isEditing ? (
                    <div className="bg-black/60 backdrop-blur-xl p-5 rounded-3xl border border-white/20 shadow-2xl" onClick={e => e.stopPropagation()}>
                        <label className="text-xs font-bold text-white/60 uppercase tracking-widest mb-2 block">Edit Caption</label>
                        <textarea 
                            value={editTitle}
                            onChange={e => setEditTitle(e.target.value)}
                            className="w-full bg-white/10 border border-white/30 rounded-xl text-white font-bold text-lg p-3 mb-4 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all resize-none"
                            placeholder="Story Caption..."
                            rows={2}
                            autoFocus
                        />
                        <div className="flex gap-3">
                            <button onClick={handleSaveEdit} className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors"><Check size={16}/> Save</button>
                            <button onClick={handleCancelEdit} className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold transition-colors">Cancel</button>
                        </div>
                    </div>
                 ) : (
                    <div className="pointer-events-auto">
                        <h2 className="text-2xl font-black leading-tight mb-2 drop-shadow-lg">{currentStory.title}</h2>
                        {currentStory.excerpt && currentStory.excerpt !== currentStory.title && (
                             <p className="text-white/90 font-medium line-clamp-3 mb-4 text-sm drop-shadow-md">{currentStory.excerpt}</p>
                        )}
                        <div className="flex flex-wrap gap-2">
                            {currentStory.tags?.map(tag => (
                                <span key={tag} className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-wider border border-white/10">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                 )}
            </div>

            {/* Navigation Click Zones - Z-10 to be below Edit/Menu but above Image */}
            <div className="absolute inset-y-0 left-0 w-1/3 z-10" onClick={(e) => { e.stopPropagation(); handlePrev(); }}></div>
            <div className="absolute inset-y-0 right-0 w-1/3 z-10" onClick={(e) => { e.stopPropagation(); handleNext(); }}></div>
        </div>

        {/* Footer / CTA */}
        <div className="absolute bottom-0 left-0 right-0 p-4 z-30 bg-gradient-to-t from-black to-transparent pt-10 pointer-events-auto">
            {currentStory.link ? (
                 <a 
                 href={currentStory.link}
                 target="_blank"
                 rel="noopener noreferrer"
                 className="w-full flex items-center justify-center gap-2 bg-white text-slate-900 py-3 rounded-full font-bold text-sm shadow-lg mb-4 hover:bg-slate-200 transition-colors"
                 onClick={e => e.stopPropagation()}
               >
                 <LinkIcon size={16} /> Visit Link
               </a>
            ) : (
                <button 
                    onClick={(e) => { e.stopPropagation(); onReadMore(currentStory); }}
                    className="w-full flex flex-col items-center justify-center gap-1 text-white opacity-80 hover:opacity-100 transition-opacity"
                >
                    <ArrowUp size={24} className="animate-bounce" />
                    <span className="text-xs font-bold uppercase tracking-widest">Read Article</span>
                </button>
            )}
            
            {/* Simple Footer */}
            <div className="flex items-center justify-end gap-4 mt-2 pb-2">
                <button 
                    onClick={(e) => e.stopPropagation()} 
                    className="p-3 bg-white/10 rounded-full text-white hover:scale-110 hover:bg-white/20 transition-all backdrop-blur-md active:scale-95"
                >
                    <Heart size={24} />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default StoryViewer;
