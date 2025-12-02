
import React, { useEffect, useState, useRef } from 'react';
import { X, ChevronRight, ChevronLeft, Heart, Send, MoreHorizontal, ArrowUp } from 'lucide-react';
import { BlogPostData } from '../types';

interface StoryViewerProps {
  stories: BlogPostData[];
  initialIndex: number;
  onClose: () => void;
  onReadMore: (story: BlogPostData) => void;
}

const StoryViewer: React.FC<StoryViewerProps> = ({ stories, initialIndex, onClose, onReadMore }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  const currentStory = stories[currentIndex];
  const DURATION = 5000; // 5 seconds per story

  useEffect(() => {
    setProgress(0);
  }, [currentIndex]);

  useEffect(() => {
    if (isPaused) return;

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
  }, [currentIndex, isPaused]);

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (progress > 10) {
        // If we are a bit into the story, restart it
        setProgress(0);
    } else if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

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
        <div className="absolute top-4 left-0 right-0 z-20 px-4 pt-2 flex justify-between items-center text-white">
            <div className="flex items-center gap-3">
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
            <div className="flex items-center gap-4">
                <button className="p-1 hover:bg-white/10 rounded-full"><MoreHorizontal size={20}/></button>
                <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full"><X size={24}/></button>
            </div>
        </div>

        {/* Main Content Area (Tap Zones) */}
        <div 
            className="flex-1 relative cursor-pointer"
            onMouseDown={() => setIsPaused(true)}
            onMouseUp={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
        >
            <img 
                src={currentStory.imageUrl} 
                className="w-full h-full object-cover"
                alt="Story"
            />
            
            {/* Gradient Overlay for Text */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/90 pointer-events-none"></div>

            {/* Story Text */}
            <div className="absolute bottom-24 left-0 right-0 p-6 text-white z-10">
                 <h2 className="text-2xl font-black leading-tight mb-2 drop-shadow-md">{currentStory.title}</h2>
                 <p className="text-white/90 font-medium line-clamp-3 mb-4 text-sm drop-shadow-sm">{currentStory.excerpt}</p>
                 <div className="flex flex-wrap gap-2">
                    {currentStory.tags?.map(tag => (
                        <span key={tag} className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-wider">
                            {tag}
                        </span>
                    ))}
                 </div>
            </div>

            {/* Navigation Click Zones */}
            <div className="absolute inset-y-0 left-0 w-1/3 z-10" onClick={(e) => { e.stopPropagation(); handlePrev(); }}></div>
            <div className="absolute inset-y-0 right-0 w-1/3 z-10" onClick={(e) => { e.stopPropagation(); handleNext(); }}></div>
        </div>

        {/* Footer / CTA */}
        <div className="absolute bottom-0 left-0 right-0 p-4 z-20 bg-gradient-to-t from-black to-transparent pt-10">
            <button 
                onClick={() => onReadMore(currentStory)}
                className="w-full flex flex-col items-center justify-center gap-1 text-white opacity-80 hover:opacity-100 transition-opacity animate-bounce"
            >
                <ArrowUp size={24} />
                <span className="text-xs font-bold uppercase tracking-widest">Read Article</span>
            </button>
            
            <div className="flex items-center gap-4 mt-4">
                <div className="flex-1 relative">
                    <input 
                        placeholder="Send message..." 
                        className="w-full bg-transparent border border-white/40 rounded-full px-4 py-2.5 text-white placeholder-white/60 focus:outline-none focus:border-white text-sm backdrop-blur-sm"
                    />
                </div>
                <button className="p-2 text-white hover:scale-110 transition-transform"><Heart size={24} /></button>
                <button className="p-2 text-white hover:scale-110 transition-transform"><Send size={24} /></button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default StoryViewer;