
import React, { useEffect, useCallback, useState, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Heart, ExternalLink, MessageCircle, Share2, Send, MoreHorizontal, Trash2 } from 'lucide-react';
import { MediaItem, User } from '../types';

interface LightboxProps {
  items: MediaItem[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  onToggleLike?: (id: string) => void;
  onAddComment?: (id: string, text: string) => void;
  onDeleteComment?: (itemId: string, commentId: string) => void;
  onShare?: (item: MediaItem) => void;
  onSelectUser?: (user: { name: string, email: string, avatar?: string }) => void;
  currentUser?: User | null;
}

const Lightbox: React.FC<LightboxProps> = ({ 
  items, 
  currentIndex, 
  isOpen, 
  onClose, 
  onNext, 
  onPrev,
  onToggleLike,
  onAddComment,
  onDeleteComment,
  onShare,
  onSelectUser,
  currentUser
}) => {
  const currentItem = items[currentIndex];
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [commentText, setCommentText] = useState('');
  const [showMobileComments, setShowMobileComments] = useState(false);
  const commentsEndRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    // Reset mobile comments view on navigation
    setShowMobileComments(false);
  }, [currentIndex]);

  // Scroll to bottom of comments when they change
  useEffect(() => {
    if (commentsEndRef.current) {
        commentsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentItem?.comments?.length]);

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

  const handleCommentSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!commentText.trim() || !onAddComment) return;
      onAddComment(currentItem.id, commentText);
      setCommentText('');
  };

  const handleAuthorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelectUser && currentItem.userId) {
        onSelectUser({ 
            name: currentItem.authorName || 'User', 
            email: currentItem.userId, 
            avatar: currentItem.authorAvatar 
        });
        onClose();
    }
  }

  // Helper for relative time
  function timeAgo(timestamp: number) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m";
    return Math.floor(seconds) + "s";
  }

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

      {/* Navigation Arrows */}
      <button
        onClick={(e) => { e.stopPropagation(); onPrev(); }}
        disabled={currentIndex === 0}
        className="absolute left-6 w-14 h-14 items-center justify-center bg-white/5 hover:bg-white/10 rounded-full text-white disabled:opacity-20 hover:-translate-x-1 transition-all z-40 hidden lg:flex"
      >
        <ChevronLeft size={32} />
      </button>

      <button
        onClick={(e) => { e.stopPropagation(); onNext(); }}
        disabled={currentIndex === items.length - 1}
        className="absolute right-6 w-14 h-14 items-center justify-center bg-white/5 hover:bg-white/10 rounded-full text-white disabled:opacity-20 hover:translate-x-1 transition-all z-40 hidden lg:flex"
      >
        <ChevronRight size={32} />
      </button>

      {/* Main Content Modal */}
      <div className="w-full max-w-[95vw] lg:max-w-[1200px] h-[90vh] bg-slate-900 lg:bg-black rounded-3xl overflow-hidden shadow-2xl flex flex-col lg:flex-row relative lg:border lg:border-white/10">
          
          {/* Left: Media Area */}
          <div className="flex-1 bg-black flex items-center justify-center relative min-h-0">
             {currentItem.type === 'image' ? (
                <img
                  src={currentItem.url}
                  alt={currentItem.name}
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <video
                  src={currentItem.url}
                  controls
                  autoPlay
                  className="max-w-full max-h-full"
                />
              )}
              
              {/* Mobile Info Overlay (Gradient) */}
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent lg:hidden flex flex-col gap-2">
                 <h2 className="text-white text-xl font-bold truncate">{currentItem.title || "Untitled"}</h2>
                 <div className="flex items-center justify-between text-white/80">
                    <button onClick={handleAuthorClick} className="flex items-center gap-2">
                         <div className="w-6 h-6 rounded-full bg-slate-500 overflow-hidden">
                             {currentItem.authorAvatar && <img src={currentItem.authorAvatar} className="w-full h-full object-cover"/>}
                         </div>
                         <span className="text-sm font-semibold">{currentItem.authorName}</span>
                    </button>
                    <div className="flex gap-4">
                        <button onClick={(e) => {e.stopPropagation(); onToggleLike && onToggleLike(currentItem.id)}} className="flex flex-col items-center">
                            <Heart size={24} fill={currentItem.likedByUser ? "white" : "none"} className={currentItem.likedByUser ? "text-pink-500" : "text-white"} />
                            <span className="text-xs">{currentItem.likes}</span>
                        </button>
                        <button onClick={(e) => {e.stopPropagation(); setShowMobileComments(true)}} className="flex flex-col items-center">
                            <MessageCircle size={24} />
                            <span className="text-xs">{currentItem.comments?.length || 0}</span>
                        </button>
                    </div>
                 </div>
              </div>
          </div>

          {/* Right: Sidebar (Desktop) / Sheet (Mobile - simplified logic here, just sticking to desktop sidebar layout mostly visible on large screens) */}
          <div className={`
              w-full lg:w-[400px] bg-white flex flex-col absolute lg:relative inset-0 z-50 lg:z-auto transition-transform duration-300
              ${showMobileComments ? 'translate-y-0' : 'translate-y-full lg:translate-y-0'}
          `}>
             {/* Mobile Close Handle */}
             <div className="lg:hidden p-4 border-b border-slate-100 flex items-center justify-between bg-white">
                 <h3 className="font-bold">Comments</h3>
                 <button onClick={() => setShowMobileComments(false)}><X size={24} className="text-slate-400"/></button>
             </div>

             {/* Header: Author & Actions */}
             <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white/50 backdrop-blur-sm sticky top-0 z-10">
                 <button onClick={handleAuthorClick} className="flex items-center gap-3 group">
                     <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
                         {currentItem.authorAvatar ? (
                             <img src={currentItem.authorAvatar} alt={currentItem.authorName} className="w-full h-full object-cover" />
                         ) : (
                             <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold">{currentItem.authorName?.charAt(0)}</div>
                         )}
                     </div>
                     <div className="leading-tight text-left">
                         <div className="font-bold text-slate-900 text-sm group-hover:text-purple-600 transition-colors">{currentItem.authorName}</div>
                         <div className="text-xs text-slate-500 font-medium">Original Creator</div>
                     </div>
                 </button>
                 <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-full"><MoreHorizontal size={20}/></button>
             </div>

             {/* Scrollable Content */}
             <div className="flex-1 overflow-y-auto p-4 space-y-6">
                 {/* Metadata */}
                 <div>
                     <h1 className="text-2xl font-black text-slate-900 mb-2">{currentItem.title || "Untitled"}</h1>
                     <p className="text-slate-600 text-sm leading-relaxed mb-3">
                        {currentItem.description || "No description provided."}
                     </p>
                     {currentItem.link && (
                         <a href={currentItem.link} target="_blank" rel="noopener" className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline">
                             <ExternalLink size={12}/> Visit Website
                         </a>
                     )}
                 </div>
                 
                 <div className="h-px bg-slate-100 w-full"></div>

                 {/* Comments List */}
                 <div className="space-y-4">
                     <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Comments ({currentItem.comments?.length || 0})</h3>
                     {currentItem.comments && currentItem.comments.length > 0 ? (
                         currentItem.comments.map((comment) => {
                             const canDelete = currentUser && (comment.userId === currentUser.email || currentItem.userId === currentUser.email);
                             return (
                                <div key={comment.id} className="flex gap-3 group relative">
                                    <div 
                                        className="w-8 h-8 rounded-full bg-slate-100 shrink-0 overflow-hidden mt-1 cursor-pointer"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (onSelectUser) onSelectUser({ name: comment.userName, email: comment.userId, avatar: comment.userAvatar });
                                            onClose();
                                        }}
                                    >
                                        {comment.userAvatar ? <img src={comment.userAvatar} className="w-full h-full object-cover"/> : null}
                                    </div>
                                    <div className="flex-1">
                                        <div className="bg-slate-50 rounded-2xl p-3 text-sm pr-8 relative">
                                            <span className="font-bold text-slate-900 mr-2 cursor-pointer hover:text-purple-600" onClick={(e) => {
                                                e.stopPropagation();
                                                if (onSelectUser) onSelectUser({ name: comment.userName, email: comment.userId, avatar: comment.userAvatar });
                                                onClose();
                                            }}>{comment.userName}</span>
                                            <span className="text-slate-600">{comment.text}</span>
                                            
                                            {canDelete && (
                                                <button 
                                                    onClick={() => onDeleteComment && onDeleteComment(currentItem.id, comment.id)}
                                                    className="absolute top-2 right-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1"
                                                    title="Delete Comment"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4 mt-1 pl-2">
                                            <span className="text-[10px] text-slate-400">{timeAgo(comment.timestamp)} ago</span>
                                            <button className="text-[10px] text-slate-400 font-bold hover:text-slate-600">Reply</button>
                                        </div>
                                    </div>
                                </div>
                             )
                         })
                     ) : (
                         <div className="text-center py-8 text-slate-400 italic text-sm">No comments yet. Be the first to say something!</div>
                     )}
                     <div ref={commentsEndRef}></div>
                 </div>
             </div>

             {/* Footer Actions & Input */}
             <div className="bg-white border-t border-slate-100 p-4">
                 <div className="flex items-center justify-between mb-4">
                     <div className="flex items-center gap-4">
                         <button 
                            onClick={(e) => { e.stopPropagation(); onToggleLike && onToggleLike(currentItem.id); }}
                            className="group flex items-center gap-1.5 transition-colors"
                         >
                            <Heart size={26} fill={currentItem.likedByUser ? "#ec4899" : "none"} className={`transition-all ${currentItem.likedByUser ? "text-pink-500 scale-110" : "text-slate-800 group-hover:text-pink-500"}`} strokeWidth={1.5} />
                         </button>
                         <button className="group flex items-center gap-1.5 transition-colors" onClick={() => document.getElementById('comment-input')?.focus()}>
                            <MessageCircle size={26} className="text-slate-800 group-hover:text-indigo-500 transition-colors" strokeWidth={1.5} />
                         </button>
                         <button 
                            onClick={(e) => { e.stopPropagation(); onShare && onShare(currentItem); }}
                            className="group flex items-center gap-1.5 transition-colors"
                         >
                            <Share2 size={26} className="text-slate-800 group-hover:text-indigo-500 transition-colors" strokeWidth={1.5} />
                         </button>
                     </div>
                     <div className="text-sm font-bold text-slate-900">{currentItem.likes} likes</div>
                 </div>
                 
                 {/* Comment Input */}
                 <form onSubmit={handleCommentSubmit} className="relative">
                     <input
                        id="comment-input"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Add a comment..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-full pl-4 pr-12 py-3 text-sm font-medium focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                     />
                     <button 
                        type="submit" 
                        disabled={!commentText.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-indigo-600 hover:text-indigo-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                     >
                         <Send size={18} />
                     </button>
                 </form>
             </div>
          </div>
      </div>
    </div>
  );
};

export default Lightbox;
