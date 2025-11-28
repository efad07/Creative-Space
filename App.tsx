
import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import MediaGallery from './components/MediaGallery';
import Lightbox from './components/Lightbox';
import Toast from './components/Toast';
import { MediaItem, ToastMessage, HeaderConfig } from './types';
import { LayoutGrid, Sparkles, Mail, MessageCircle, Megaphone, Lightbulb, X, Info, Shield, Send } from 'lucide-react';

// Ad Placeholder Component
const AdPlaceholder: React.FC<{ className?: string; label: string; size: string }> = ({ className, label, size }) => (
  <div className={`bg-slate-100 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center text-slate-400 p-4 transition-all hover:bg-slate-200 hover:border-slate-400 ${className}`}>
    <Megaphone className="mb-2 opacity-50" size={24} />
    <span className="font-bold uppercase tracking-widest text-xs mb-1">Advertisement</span>
    <span className="text-xs font-mono opacity-75">{label}</span>
    <span className="text-[10px] font-mono opacity-50 mt-1">{size}</span>
  </div>
);

const App: React.FC = () => {
  // --- State ---
  const [headerConfig, setHeaderConfig] = useState<HeaderConfig>({
    title: "Creative Space",
    description: "A curated collection of visual stories and inspiration.",
    photoUrl: null
  });

  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [lightboxState, setLightboxState] = useState<{ isOpen: boolean; index: number }>({
    isOpen: false,
    index: 0
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  // Use a single state for active modal to manage multiple overlays
  const [activeModal, setActiveModal] = useState<'inspiration' | 'about' | 'privacy' | 'contact' | null>(null);
  const [activeNav, setActiveNav] = useState('Home');

  // --- Handlers ---
  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const updateHeaderPhoto = (url: string | null) => {
    setHeaderConfig((prev) => ({ ...prev, photoUrl: url }));
  };

  const updateHeaderInfo = (title: string, description: string) => {
    setHeaderConfig((prev) => ({ ...prev, title, description }));
  };

  const addMediaItems = (newItems: MediaItem[]) => {
    setMediaItems((prev) => [...prev, ...newItems]);
  };

  const updateMediaItem = (id: string, updates: Partial<MediaItem>) => {
    setMediaItems((prev) => 
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
    showToast('Media details updated', 'success');
  };

  const removeMediaItem = (id: string) => {
    setMediaItems((prev) => {
      const itemToRemove = prev.find(item => item.id === id);
      if (itemToRemove && itemToRemove.url.startsWith('blob:')) {
        URL.revokeObjectURL(itemToRemove.url);
      }
      return prev.filter((item) => item.id !== id);
    });
    showToast('Media item deleted', 'success');
  };

  const toggleLike = (id: string) => {
    setMediaItems((prev) => 
      prev.map((item) => {
        if (item.id === id) {
          const isLiked = !item.likedByUser;
          return {
            ...item,
            likedByUser: isLiked,
            likes: isLiked ? item.likes + 1 : item.likes - 1
          };
        }
        return item;
      })
    );
  };

  const incrementView = (id: string) => {
    setMediaItems((prev) => 
      prev.map((item) => 
        item.id === id ? { ...item, views: item.views + 1 } : item
      )
    );
  };

  const openLightbox = (index: number) => {
    if (mediaItems[index]) {
      incrementView(mediaItems[index].id);
    }
    setLightboxState({ isOpen: true, index });
  };

  const closeLightbox = () => {
    setLightboxState((prev) => ({ ...prev, isOpen: false }));
  };

  const nextMedia = () => {
    const nextIndex = Math.min(lightboxState.index + 1, mediaItems.length - 1);
    if (nextIndex !== lightboxState.index) {
       incrementView(mediaItems[nextIndex].id);
       setLightboxState((prev) => ({ ...prev, index: nextIndex }));
    }
  };

  const prevMedia = () => {
    const prevIndex = Math.max(lightboxState.index - 1, 0);
    if (prevIndex !== lightboxState.index) {
      incrementView(mediaItems[prevIndex].id);
      setLightboxState((prev) => ({ ...prev, index: prevIndex }));
    }
  };

  const handleNavClick = (name: string) => {
    setActiveNav(name);
    if (name === 'Inspiration') setActiveModal('inspiration');
    if (name === 'About Us') setActiveModal('about');
    if (name === 'Privacy Policy') setActiveModal('privacy');
    if (name === 'Contact Us') setActiveModal('contact');
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveModal(null);
    showToast('Message sent successfully!', 'success');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-violet-200 selection:text-violet-900">
      <Toast toasts={toasts} removeToast={removeToast} />
      
      {/* Floating Glass Navigation */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-white/80 backdrop-blur-xl border border-white/40 shadow-xl shadow-slate-200/50 rounded-full px-2 py-2 flex items-center gap-1 transition-all duration-300 max-w-[95vw] overflow-x-auto no-scrollbar">
        {[
          { name: 'Home', icon: LayoutGrid },
          { name: 'About Us', icon: Info },
          { name: 'Inspiration', icon: Sparkles },
          { name: 'Privacy Policy', icon: Shield },
          { name: 'Contact Us', icon: Mail }
        ].map((item) => (
          <button
            key={item.name}
            onClick={() => handleNavClick(item.name)}
            className={`flex items-center gap-2 px-4 md:px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 whitespace-nowrap ${
              activeNav === item.name
                ? 'bg-slate-900 text-white shadow-lg' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <item.icon size={16} />
            <span className="hidden md:inline">{item.name}</span>
          </button>
        ))}
      </nav>

      <Header 
        config={headerConfig} 
        onUpdatePhoto={updateHeaderPhoto}
        onUpdateInfo={updateHeaderInfo}
        onShowToast={showToast}
      />

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Ad Space: Top Leaderboard */}
        <div className="w-full flex justify-center mb-16">
          <AdPlaceholder className="w-full max-w-[728px] h-[90px] hidden md:flex" label="Leaderboard Ad" size="728x90" />
          <AdPlaceholder className="w-full h-[100px] md:hidden" label="Mobile Banner Ad" size="Responsive" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content Area */}
          <div className="lg:col-span-9">
            <MediaGallery 
              items={mediaItems}
              onAddItems={addMediaItems}
              onUpdateItem={updateMediaItem}
              onRemoveItem={removeMediaItem}
              onOpenLightbox={openLightbox}
              onShowToast={showToast}
              onToggleLike={toggleLike}
            />
          </div>

          {/* Ad Column (Replaces Sidebar) */}
          <div className="lg:col-span-3 space-y-8">
             {/* Inspiration Block (Sidebar Preview) */}
             <div 
               className="bg-gradient-to-br from-violet-600 to-fuchsia-600 p-8 rounded-3xl text-white shadow-xl shadow-violet-500/20 relative overflow-hidden group cursor-pointer transform hover:-translate-y-1 transition-all duration-300"
               onClick={() => setActiveModal('inspiration')}
             >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-white/20 transition-all duration-500"></div>
                <div className="relative z-10">
                  <h3 className="font-bold text-2xl mb-4 flex items-center gap-2">
                    <Lightbulb className="text-yellow-300 fill-current" /> Daily Inspiration
                  </h3>
                  <p className="text-white/90 font-medium leading-relaxed mb-6 text-sm">
                    "Creativity is intelligence having fun." <br/><br/>
                    Let these visuals spark your imagination and fuel your next big idea.
                  </p>
                  <button className="bg-white/20 backdrop-blur-md border border-white/30 text-white px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-white hover:text-violet-600 transition-all">
                    View Full
                  </button>
                </div>
             </div>

             <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Sponsored</h3>
                <AdPlaceholder className="w-full h-[250px]" label="Medium Rectangle" size="300x250" />
             </div>

             <div className="sticky top-28 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Advertisement</h3>
                <AdPlaceholder className="w-full h-[600px]" label="Large Skyscraper" size="300x600" />
             </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-slate-100 py-16 mt-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 gradient-bg opacity-30"></div>
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-extrabold mb-6 gradient-text inline-block">{headerConfig.title}</h2>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">
            Crafting digital experiences with passion and precision. Join our community of creators.
          </p>
          <div className="flex justify-center gap-6 mb-8">
             {[1,2,3].map(i => (
               <div key={i} className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-violet-600 hover:border-violet-200 hover:bg-violet-50 transition-all cursor-pointer">
                 <MessageCircle size={18} />
               </div>
             ))}
          </div>
          <p className="text-slate-400 text-sm font-medium">© 2025 Creative Studio. All rights reserved.</p>
        </div>
      </footer>

      {/* Lightbox */}
      <Lightbox 
        items={mediaItems}
        currentIndex={lightboxState.index}
        isOpen={lightboxState.isOpen}
        onClose={closeLightbox}
        onNext={nextMedia}
        onPrev={prevMedia}
        onToggleLike={toggleLike}
      />

      {/* Inspiration Modal */}
      {activeModal === 'inspiration' && (
        <div 
          className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300"
          onClick={() => setActiveModal(null)}
        >
          <div 
            className="relative w-full max-w-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 p-12 rounded-[2.5rem] text-white shadow-2xl transform scale-100 animate-in zoom-in-95 duration-300 overflow-hidden" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Background Decorative Blobs */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl -ml-20 -mb-20"></div>

            <button 
               onClick={() => setActiveModal(null)}
               className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center bg-white/10 rounded-full text-white/70 hover:bg-white/20 hover:text-white transition-all"
            >
              <X size={20} />
            </button>
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="mb-8 flex justify-center">
                <div className="p-6 bg-white/10 rounded-full ring-4 ring-white/5 shadow-inner">
                   <Lightbulb size={48} className="text-yellow-300 fill-current drop-shadow-lg" />
                </div>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-black mb-8 tracking-tight">Daily Inspiration</h2>
              
              <div className="relative">
                <Sparkles className="absolute -top-6 -left-6 text-yellow-300 opacity-50 w-8 h-8" />
                <blockquote className="text-2xl md:text-3xl font-medium leading-relaxed mb-8 italic text-white/95">
                  "Creativity is intelligence having fun."
                </blockquote>
                <Sparkles className="absolute -bottom-6 -right-6 text-yellow-300 opacity-50 w-8 h-8" />
              </div>
              
              <p className="text-white/80 text-lg mb-10 max-w-md leading-relaxed font-light">
                Let these visuals spark your imagination and fuel your next big idea. Beauty is everywhere—you just have to look for it.
              </p>

              <button 
                onClick={() => setActiveModal(null)}
                className="bg-white text-violet-600 px-10 py-4 rounded-full font-bold text-lg uppercase tracking-wider hover:bg-violet-50 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-violet-900/20"
              >
                Get Inspired
              </button>
            </div>
          </div>
        </div>
      )}

      {/* About Us Modal */}
      {activeModal === 'about' && (
        <div 
          className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300"
          onClick={() => setActiveModal(null)}
        >
          <div 
            className="relative w-full max-w-2xl bg-white p-10 rounded-[2.5rem] shadow-2xl transform scale-100 animate-in zoom-in-95 duration-300 overflow-hidden" 
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => setActiveModal(null)} className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
              <X size={20} className="text-slate-500" />
            </button>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-violet-100 text-violet-600 rounded-2xl mb-6">
                <Info size={32} />
              </div>
              <h2 className="text-3xl font-black text-slate-900 mb-4">About Us</h2>
              <div className="h-1 w-20 bg-gradient-to-r from-violet-500 to-fuchsia-500 mx-auto rounded-full mb-8"></div>
              
              <div className="text-slate-600 space-y-4 text-lg leading-relaxed">
                <p>
                  Welcome to <strong className="text-violet-600">{headerConfig.title}</strong>, a digital sanctuary for creatives, dreamers, and visionaries.
                </p>
                <p>
                  Our mission is simple: to curate and share the most inspiring visual content from around the globe. Whether you're a designer looking for your next big idea, or simply someone who appreciates beauty, you've found your home.
                </p>
                <p>
                  Founded in 2025, we believe that great design has the power to change the world. Join our community and let's create something beautiful together.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      {activeModal === 'privacy' && (
        <div 
          className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300"
          onClick={() => setActiveModal(null)}
        >
          <div 
            className="relative w-full max-w-2xl bg-white p-10 rounded-[2.5rem] shadow-2xl transform scale-100 animate-in zoom-in-95 duration-300 overflow-hidden max-h-[90vh] flex flex-col" 
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => setActiveModal(null)} className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center bg-slate-100 rounded-full hover:bg-slate-200 transition-colors z-10">
              <X size={20} className="text-slate-500" />
            </button>
            
            <div className="text-center flex-shrink-0">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 text-slate-600 rounded-2xl mb-6">
                <Shield size={32} />
              </div>
              <h2 className="text-3xl font-black text-slate-900 mb-2">Privacy Policy</h2>
              <p className="text-slate-400 text-sm mb-6">Last updated: January 2025</p>
            </div>

            <div className="overflow-y-auto pr-2 text-slate-600 text-sm leading-relaxed space-y-4 text-left custom-scrollbar">
              <p>
                At <strong>{headerConfig.title}</strong>, we take your privacy seriously. This policy describes how we collect, use, and handle your information.
              </p>
              <h3 className="text-slate-900 font-bold text-lg mt-4">1. Information We Collect</h3>
              <p>
                We collect information you provide directly to us, such as when you create an account, subscribe to our newsletter, or contact us for support. This may include your name, email address, and any other information you choose to provide.
              </p>
              <h3 className="text-slate-900 font-bold text-lg mt-4">2. How We Use Information</h3>
              <p>
                We use the information we collect to operate, maintain, and improve our services, to develop new features, and to protect our users. We also use this information to communicate with you, such as to send you updates and security alerts.
              </p>
              <h3 className="text-slate-900 font-bold text-lg mt-4">3. Data Security</h3>
              <p>
                We implement appropriate technical and organizational measures to protect the security of your personal information. However, please note that no system is completely secure.
              </p>
              <h3 className="text-slate-900 font-bold text-lg mt-4">4. Contact Us</h3>
              <p>
                If you have any questions about this Privacy Policy, please contact us via our Contact form.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Contact Us Modal */}
      {activeModal === 'contact' && (
        <div 
          className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300"
          onClick={() => setActiveModal(null)}
        >
          <div 
            className="relative w-full max-w-xl bg-white p-10 rounded-[2.5rem] shadow-2xl transform scale-100 animate-in zoom-in-95 duration-300 overflow-hidden" 
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => setActiveModal(null)} className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
              <X size={20} className="text-slate-500" />
            </button>
            
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-pink-100 text-pink-600 rounded-2xl mb-6">
                <Mail size={32} />
              </div>
              <h2 className="text-3xl font-black text-slate-900 mb-2">Get in Touch</h2>
              <p className="text-slate-500">We'd love to hear from you. Send us a message!</p>
            </div>

            <form onSubmit={handleContactSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Your Name</label>
                <input required type="text" placeholder="John Doe" className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all outline-none font-medium" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Email Address</label>
                <input required type="email" placeholder="john@example.com" className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all outline-none font-medium" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Message</label>
                <textarea required rows={4} placeholder="How can we help you?" className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all outline-none font-medium resize-none"></textarea>
              </div>
              
              <button type="submit" className="w-full py-4 gradient-bg text-white font-bold rounded-xl shadow-lg shadow-violet-500/30 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2">
                <Send size={18} />
                Send Message
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
