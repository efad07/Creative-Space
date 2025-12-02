
import React, { useState, useCallback, useEffect, useRef } from 'react';
import Header from './components/Header';
import MediaGallery from './components/MediaGallery';
import Lightbox from './components/Lightbox';
import Toast from './components/Toast';
import BlogPost from './components/BlogPost';
import SearchBar from './components/SearchBar';
import GoogleAd from './components/GoogleAd';
import StoryViewer from './components/StoryViewer';
import ProfileSettings from './components/ProfileSettings';
import { MediaItem, ToastMessage, HeaderConfig, User, BlogPostData } from './types';
import { Chrome, LogOut, ArrowLeft, Heart, Grid, List, Plus, Settings } from 'lucide-react';
import { saveMediaItemToDB, getMediaItemsFromDB, deleteMediaItemFromDB, saveConfigToDB, getConfigFromDB, deleteUserMediaFromDB, registerUser, authenticateUser, updateUser, saveUserToDB } from './db';

// Sample Data for Blog
const INITIAL_STORIES: BlogPostData[] = [
  {
    id: '1',
    title: 'The Art of Minimalist Photography',
    excerpt: 'Discover how less can be more. We explore the techniques behind stunning minimalist compositions.',
    date: 'Mar 15, 2025',
    author: 'Elena Fisher',
    readTime: '5 min',
    imageUrl: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    tags: ['Photography', 'Minimalism'],
    content: `<p>Full content...</p>`
  },
  {
    id: '2',
    title: 'Color Theory in Digital Design',
    excerpt: 'Understanding the psychological impact of color is crucial for any designer.',
    date: 'Mar 12, 2025',
    author: 'Marcus Chen',
    readTime: '8 min',
    imageUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    tags: ['Design', 'UX'],
    content: `<p>Full content...</p>`
  },
  {
    id: '3',
    title: 'Capturing Urban Solitude',
    excerpt: 'A photo essay on finding silence in the chaos of the city.',
    date: 'Mar 10, 2025',
    author: 'Sarah Jenkins',
    readTime: '6 min',
    imageUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    tags: ['Urban', 'Travel'],
    content: `<p>Full content...</p>`
  },
  {
    id: '4',
    title: 'Modern Architecture',
    excerpt: 'The lines between nature and structure are blurring in modern architectural trends.',
    date: 'Mar 08, 2025',
    author: 'David Wright',
    readTime: '4 min',
    imageUrl: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    tags: ['Architecture', 'Design'],
    content: `<p>Full content...</p>`
  },
  {
    id: '5',
    title: 'Neon Nights',
    excerpt: 'Cyberpunk aesthetics in real world photography.',
    date: 'Mar 05, 2025',
    author: 'Alice V.',
    readTime: '3 min',
    imageUrl: 'https://images.unsplash.com/photo-1555685812-4b943f3e9942?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    tags: ['Photography', 'Neon'],
    content: `<p>Full content...</p>`
  }
];

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
  const [activeModal, setActiveModal] = useState<'auth' | 'profile' | null>(null);
  
  // Story States
  const [stories, setStories] = useState<BlogPostData[]>(INITIAL_STORIES);
  const [activeStory, setActiveStory] = useState<BlogPostData | null>(null); // For Reading
  const [viewingStoryIndex, setViewingStoryIndex] = useState<number | null>(null); // For Story Player
  const [watchedStories, setWatchedStories] = useState<string[]>([]);
  const storyInputRef = useRef<HTMLInputElement>(null);

  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeNav, setActiveNav] = useState('All');
  
  // New Filter & View States
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const [isLoading, setIsLoading] = useState(true);

  // Auth Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // --- Initialization ---
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedUser = localStorage.getItem('creative_space_user');
        if (savedUser) setCurrentUser(JSON.parse(savedUser));
        const savedConfig = await getConfigFromDB();
        if (savedConfig) setHeaderConfig(savedConfig);
        const savedMedia = await getMediaItemsFromDB();
        setMediaItems(savedMedia);
        
        // Load watched stories
        const savedWatched = localStorage.getItem('creative_space_watched_stories');
        if(savedWatched) setWatchedStories(JSON.parse(savedWatched));
      } catch (error) {
        console.error("Failed to load data", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // --- Helper to get Consistent Author Info ---
  const getCurrentAuthorInfo = () => {
    if (!currentUser) return { name: 'Guest User', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guest', email: 'guest' };
    
    const name = currentUser.name || 'Anonymous';
    // Use uploaded avatar OR generate a deterministic one based on name so user always has a graphical avatar
    const avatar = currentUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.replace(/\s/g, '')}`;
    
    return { name, avatar, email: currentUser.email };
  };

  const updateHeaderPhoto = async (url: string | null) => {
    const newConfig = { ...headerConfig, photoUrl: url };
    setHeaderConfig(newConfig);
    await saveConfigToDB(newConfig);
  };

  const updateHeaderInfo = async (title: string, description: string) => {
    const newConfig = { ...headerConfig, title, description };
    setHeaderConfig(newConfig);
    await saveConfigToDB(newConfig);
  };

  const addMediaItems = async (newItems: MediaItem[]) => {
    const authorInfo = getCurrentAuthorInfo();
    
    const itemsWithUser = newItems.map(item => ({
      ...item,
      userId: authorInfo.email,
      authorName: authorInfo.name,
      authorAvatar: authorInfo.avatar
    }));
    
    setMediaItems((prev) => [...prev, ...itemsWithUser]);
    for (const item of itemsWithUser) {
        if (item.url && item.url.startsWith('blob:')) {
            try {
                const response = await fetch(item.url);
                const blob = await response.blob();
                await saveMediaItemToDB({ ...item, blob });
            } catch (e) { console.error(e); }
        }
    }
  };

  const updateMediaItem = async (id: string, updates: Partial<MediaItem>) => {
    setMediaItems(prev => prev.map(item => {
       if (item.id === id) {
           const updated = { ...item, ...updates };
           saveMediaItemToDB(updated);
           return updated;
       }
       return item;
    }));
  };

  const removeMediaItem = async (id: string) => {
    setMediaItems(prev => prev.filter(item => item.id !== id));
    await deleteMediaItemFromDB(id);
    showToast('Item deleted', 'success');
  };

  const clearAllMedia = async () => {
    if (!currentUser?.email) return;
    setMediaItems(prev => prev.filter(item => item.userId !== currentUser.email));
    await deleteUserMediaFromDB(currentUser.email);
    showToast('Gallery cleared', 'success');
  };

  const handleSaveItem = async (item: MediaItem) => {
    if (!currentUser) {
        showToast('Please sign in to save items', 'error');
        setActiveModal('auth');
        return;
    }
    const newId = Math.random().toString(36).substring(2) + Date.now().toString(36);
    let blob = item.blob;
    if (!blob && item.url) {
        try { 
          const r = await fetch(item.url); 
          if(r.ok) blob = await r.blob(); 
        } catch(e){}
    }
    
    const authorInfo = getCurrentAuthorInfo();
    const newItem = { 
        ...item, 
        id: newId, 
        userId: authorInfo.email, 
        authorName: authorInfo.name, 
        authorAvatar: authorInfo.avatar, 
        likes: 0, 
        views: 0, 
        likedByUser: false, 
        blob 
    };

    await new Promise(r => setTimeout(r, 600));
    setMediaItems(prev => [newItem, ...prev]);
    await saveMediaItemToDB(newItem);
    showToast('Item saved to your collection', 'success');
  };

  const toggleLike = (id: string) => {
    setMediaItems(prev => prev.map(item => {
        if (item.id === id) {
            const isLiked = !item.likedByUser;
            const updated = { ...item, likedByUser: isLiked, likes: isLiked ? item.likes + 1 : item.likes - 1 };
            saveMediaItemToDB(updated);
            return updated;
        }
        return item;
    }));
  };

  const incrementView = (id: string) => {
    setMediaItems(prev => prev.map(item => {
        if (item.id === id) {
            const updated = { ...item, views: (item.views || 0) + 1 };
            saveMediaItemToDB(updated);
            return updated;
        }
        return item;
    }));
  };

  const handleStoryOpen = (index: number) => {
    setViewingStoryIndex(index);
    const storyId = stories[index].id;
    if (!watchedStories.includes(storyId)) {
        const newWatched = [...watchedStories, storyId];
        setWatchedStories(newWatched);
        localStorage.setItem('creative_space_watched_stories', JSON.stringify(newWatched));
    }
  };

  const handleStoryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!currentUser) {
        showToast('Please sign in to post stories', 'error');
        setActiveModal('auth');
        return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
        if (typeof event.target?.result === 'string') {
            const authorInfo = getCurrentAuthorInfo();
            const newStory: BlogPostData = {
                id: Math.random().toString(36).substr(2, 9),
                title: 'New Story',
                excerpt: 'Just posted a new story!',
                date: 'Just now',
                author: authorInfo.name,
                authorAvatar: authorInfo.avatar,
                readTime: '1 min',
                imageUrl: event.target.result,
                tags: ['Story', 'New'],
                content: '<p>New story update...</p>'
            };
            setStories(prev => [newStory, ...prev]);
            showToast('Your story has been added!', 'success');
        }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const getDisplayedItems = () => {
    let items = mediaItems;
    if (activeNav === 'My Gallery' && currentUser) items = items.filter(item => item.userId === currentUser.email);
    if (activeCategory !== 'All') items = items.filter(item => item.category === activeCategory);
    if (searchQuery) items = items.filter(item => (item.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) || item.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return items;
  };

  const displayedItems = getDisplayedItems();
  const displayedPosts = stories.filter(post => !searchQuery || post.title.toLowerCase().includes(searchQuery.toLowerCase()));

  // Auth & Nav Handlers
  const handleAuthClick = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    setActiveModal('auth');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('creative_space_user');
    setActiveNav('All');
    showToast('Logged out', 'success');
  };

  const handleGoogleLogin = async () => {
      const user = { name: "Google User", email: "google@user.com", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Google" };
      try {
        await saveUserToDB(user);
      } catch (e) {
        console.error("Failed to sync Google user to DB", e);
      }
      
      setCurrentUser(user);
      localStorage.setItem('creative_space_user', JSON.stringify(user));
      setActiveModal(null);
      showToast('Signed in with Google', 'success');
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
      e.preventDefault();
      setAuthLoading(true);
      try {
          const user = authMode === 'signup' 
            ? await registerUser(email, password, name) 
            : await authenticateUser(email, password);
          setCurrentUser(user);
          localStorage.setItem('creative_space_user', JSON.stringify(user));
          setActiveModal(null);
          showToast('Success!', 'success');
      } catch(e: any) { showToast(e.message, 'error'); } 
      finally { setAuthLoading(false); }
  };
  
  const handleUpdateProfile = async (updates: Partial<User>) => {
      if (!currentUser) return;
      try {
          let updatedUser;
          try {
             updatedUser = await updateUser(currentUser.email, updates);
          } catch (dbError: any) {
             // If user missing in DB (cleared cache or Google login issue), try to recover
             if (dbError.message === "User not found") {
                 const recoveredUser = { ...currentUser, ...updates };
                 await saveUserToDB(recoveredUser);
                 updatedUser = recoveredUser;
             } else {
                 throw dbError;
             }
          }

          try {
             localStorage.setItem('creative_space_user', JSON.stringify(updatedUser));
          } catch(storageError) {
             throw new Error("Storage full. Image likely too large.");
          }
          setCurrentUser(updatedUser);

          // --- SYNC UPDATE: Update all previous posts by this user ---
          if (updates.avatar || updates.name) {
             const newName = updatedUser.name;
             const newAvatar = updatedUser.avatar;

             // 1. Update Gallery Items
             setMediaItems(prev => prev.map(item => {
                 if (item.userId === currentUser.email) {
                     const updatedItem = { ...item, authorName: newName, authorAvatar: newAvatar };
                     saveMediaItemToDB(updatedItem);
                     return updatedItem;
                 }
                 return item;
             }));

             // 2. Update Stories
             setStories(prev => prev.map(story => {
                if (story.author === currentUser.name) {
                    return { ...story, author: newName, authorAvatar: newAvatar };
                }
                return story;
             }));
          }

          showToast('Profile updated successfully', 'success');
      } catch (e: any) {
          console.error(e);
          showToast(e.message || 'Failed to update profile', 'error');
          throw e; 
      }
  };

  if (isLoading) return <div className="h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="min-h-screen text-slate-900 font-sans selection:bg-purple-200 selection:text-purple-900 relative overflow-x-hidden">
      <Toast toasts={toasts} removeToast={removeToast} />
      
      {/* Floating Navigation */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 glass-panel shadow-2xl shadow-purple-900/10 rounded-full px-2 py-2 flex items-center gap-1 transition-all duration-300 max-w-[95%]">
        <button onClick={() => setActiveNav('All')} className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${activeNav === 'All' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'}`}>All</button>
        {currentUser && <button onClick={() => setActiveNav('My Gallery')} className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${activeNav === 'My Gallery' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'}`}>My Gallery</button>}
        
        <div className="w-px h-6 bg-slate-200/50 mx-2 hidden sm:block"></div>

        {currentUser ? (
           <div className="flex items-center gap-2 pr-1 pl-1">
             <div 
                className="w-9 h-9 rounded-full overflow-hidden border-2 border-white shadow-sm cursor-pointer hover:ring-2 hover:ring-purple-400 transition-all bg-slate-200"
                onClick={() => setActiveModal('profile')}
             >
               {currentUser.avatar ? (
                 <img src={currentUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center bg-purple-500 text-white font-bold text-xs">
                   {currentUser.name.charAt(0)}
                 </div>
               )}
             </div>
             <button onClick={() => setActiveModal('profile')} className="p-2 text-slate-400 hover:text-slate-700 transition-colors" title="Settings">
                 <Settings size={18} />
             </button>
             <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-500 transition-colors" title="Logout"><LogOut size={18} /></button>
           </div>
        ) : (
          <div className="flex items-center gap-1 pl-1 pr-1">
             <button onClick={() => handleAuthClick('signin')} className="px-5 py-2.5 rounded-full text-sm font-bold text-slate-600 hover:text-purple-600 transition-all hover:bg-white/50">Sign In</button>
             <button onClick={() => handleAuthClick('signup')} className="px-6 py-2.5 rounded-full text-sm font-bold bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:opacity-90 transition-all shadow-lg shadow-purple-500/20">Sign Up</button>
          </div>
        )}
      </nav>

      <Header 
        config={headerConfig} 
        onUpdatePhoto={updateHeaderPhoto}
        onUpdateInfo={updateHeaderInfo}
        onShowToast={showToast}
      />

      <main className="max-w-[1400px] mx-auto px-4 md:px-8 py-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* Story Tray */}
        <div className="mb-12 overflow-x-auto no-scrollbar py-4 -mx-4 px-4 md:mx-0 md:px-0">
          <div className="flex gap-4 min-w-max">
            {/* My Story (Add) */}
            <div 
                className="flex flex-col items-center gap-2 cursor-pointer group" 
                onClick={() => storyInputRef.current?.click()}
            >
               <input 
                 type="file" 
                 ref={storyInputRef} 
                 onChange={handleStoryUpload} 
                 className="hidden" 
                 accept="image/*" 
               />
               <div className="w-20 h-20 rounded-full bg-slate-100 border-2 border-white shadow-md flex items-center justify-center relative group-hover:scale-105 transition-transform">
                  <div className="absolute inset-0 rounded-full overflow-hidden opacity-60">
                    <img src={currentUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${(currentUser?.name || 'guest').replace(/\s/g, '')}`} className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 bg-purple-600 rounded-full border-2 border-white flex items-center justify-center text-white z-10 shadow-sm">
                    <Plus size={14} strokeWidth={3}/>
                  </div>
               </div>
               <span className="text-xs font-semibold text-slate-500">Your Story</span>
            </div>

            {/* Other Stories */}
            {stories.map((story, index) => {
               const isWatched = watchedStories.includes(story.id);
               return (
                <div key={story.id} className="flex flex-col items-center gap-2 cursor-pointer group" onClick={() => handleStoryOpen(index)}>
                   <div className={`w-20 h-20 rounded-full p-[3px] group-hover:scale-105 transition-transform duration-300 ${isWatched ? 'bg-slate-200' : 'bg-gradient-to-tr from-yellow-400 via-orange-500 to-fuchsia-600'}`}>
                      <div className="w-full h-full rounded-full border-2 border-white overflow-hidden bg-white relative">
                        <img src={story.imageUrl} className="w-full h-full object-cover" />
                      </div>
                   </div>
                   <span className="text-xs font-semibold text-slate-600 max-w-[80px] truncate">{story.author.split(' ')[0]}</span>
                </div>
               );
            })}
          </div>
        </div>

        {/* Leaderboard Ad */}
        <div className="w-full flex justify-center mb-16">
          <GoogleAd 
            className="w-full max-w-[970px] h-[90px] md:h-[250px] shadow-sm" 
            slot="1234567890" 
            format="horizontal" 
          />
        </div>

        {/* Main Content Area */}
        <div className="w-full">
            <div className="mb-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                <div>
                    <h2 className="text-5xl font-black text-slate-900 mb-3 tracking-tight">
                    {activeNav === 'My Gallery' ? 'My Collections' : 'Community Feed'}
                    </h2>
                    <p className="text-slate-500 font-medium text-lg">
                    {activeNav === 'My Gallery' ? 'Manage your personal uploads.' : 'Discover inspiring work from creators worldwide.'}
                    </p>
                </div>
                {/* View Toggle */}
                {activeNav !== 'Stories' && (
                    <div className="flex bg-white/50 backdrop-blur-md rounded-2xl p-1 border border-white shadow-sm">
                        <button onClick={() => setViewMode('grid')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white shadow-md text-purple-600' : 'text-slate-400 hover:text-slate-600'}`}><Grid size={20}/></button>
                        <button onClick={() => setViewMode('list')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white shadow-md text-purple-600' : 'text-slate-400 hover:text-slate-600'}`}><List size={20}/></button>
                    </div>
                )}
            </div>

            <div className="space-y-6">
                <SearchBar value={searchQuery} onChange={setSearchQuery} />
                
                {/* Categories Filter Bar */}
                {activeNav !== 'Stories' && (
                    <div className="flex overflow-x-auto pb-4 gap-3 no-scrollbar items-center">
                        {['All', 'Photography', 'Art', 'Design', 'Tech', 'Lifestyle'].map(cat => (
                            <button 
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${
                                    activeCategory === cat 
                                    ? 'bg-slate-900 text-white border-slate-900' 
                                    : 'bg-white/40 border-slate-200 text-slate-600 hover:bg-white hover:border-purple-300 hover:text-purple-600'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                )}
            </div>
            </div>

            {/* In-feed Ad */}
            <GoogleAd className="w-full h-[120px] mb-12 shadow-sm" slot="0987654321" format="horizontal" />

            <MediaGallery 
                items={displayedItems}
                onAddItems={addMediaItems}
                onUpdateItem={updateMediaItem}
                onRemoveItem={removeMediaItem}
                onOpenLightbox={(i) => {
                    setLightboxState({ isOpen: true, index: i });
                    const item = displayedItems[i];
                    if (item) incrementView(item.id);
                }}
                onShowToast={showToast}
                onToggleLike={toggleLike}
                onClearAll={clearAllMedia}
                onSaveItem={handleSaveItem}
                currentUser={currentUser}
                allowUpload={activeNav === 'My Gallery'}
                viewMode={viewMode}
            />
        </div>
      </main>

      {/* Footer Ad */}
      <div className="max-w-[1200px] mx-auto px-4 mb-8">
        <GoogleAd className="w-full h-[200px]" slot="5555555555" format="auto" />
      </div>

      <footer className="bg-white/50 backdrop-blur-lg border-t border-slate-200 py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
             <h2 className="text-4xl font-black mb-6 gradient-text">{headerConfig.title}</h2>
             <div className="flex justify-center gap-6 mb-8">
                {['About', 'Privacy', 'Contact', 'Terms'].map(item => (
                    <a key={item} href="#" className="text-slate-500 font-bold hover:text-purple-600 transition-colors">{item}</a>
                ))}
             </div>
             <p className="text-slate-400 text-sm font-medium">© 2025 Creative Space Studio. All rights reserved.</p>
        </div>
      </footer>

      <Lightbox 
        items={displayedItems}
        currentIndex={lightboxState.index}
        isOpen={lightboxState.isOpen}
        onClose={() => setLightboxState(p => ({...p, isOpen: false}))}
        onNext={() => {
            const nextIndex = Math.min(lightboxState.index + 1, displayedItems.length - 1);
            setLightboxState(p => ({...p, index: nextIndex}));
            const item = displayedItems[nextIndex];
            if (item) incrementView(item.id);
        }}
        onPrev={() => {
            const prevIndex = Math.max(lightboxState.index - 1, 0);
            setLightboxState(p => ({...p, index: prevIndex}));
            const item = displayedItems[prevIndex];
            if (item) incrementView(item.id);
        }}
        onToggleLike={toggleLike}
      />
      
      {/* Immersive Story Viewer */}
      {viewingStoryIndex !== null && (
        <StoryViewer 
            stories={stories} 
            initialIndex={viewingStoryIndex} 
            onClose={() => setViewingStoryIndex(null)}
            onReadMore={(story) => {
                setViewingStoryIndex(null);
                setActiveStory(story);
            }}
        />
      )}

      {/* Story Reader Modal (Long Form) */}
      {activeStory && (
        <div className="fixed inset-0 z-[100] bg-white overflow-y-auto animate-in slide-in-from-bottom-10">
           <div className="sticky top-0 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-4 flex justify-between items-center z-10">
              <button onClick={() => setActiveStory(null)} className="flex items-center gap-2 font-bold text-slate-600 hover:text-purple-600 bg-slate-50 px-4 py-2 rounded-full hover:bg-purple-50 transition-colors"><ArrowLeft size={20}/> Back</button>
              <div className="flex gap-2"><button className="p-3 rounded-full bg-slate-50 hover:bg-pink-50 hover:text-pink-500 transition-colors"><Heart size={20}/></button></div>
           </div>
           <article className="max-w-3xl mx-auto px-6 py-16">
              <div className="flex gap-3 mb-6">
                {activeStory.tags?.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-xs font-bold uppercase">{tag}</span>
                ))}
              </div>
              <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-8 leading-tight">{activeStory.title}</h1>
              {activeStory.imageUrl && <img src={activeStory.imageUrl} className="w-full rounded-[2.5rem] shadow-2xl mb-12" />}
              <div className="prose prose-xl prose-slate mx-auto">
                <p className="text-2xl text-slate-600 font-medium leading-relaxed mb-8">{activeStory.excerpt}</p>
                <div dangerouslySetInnerHTML={{ __html: activeStory.content || '' }} />
              </div>
           </article>
        </div>
      )}

      {/* Auth Modal */}
      {activeModal === 'auth' && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={() => setActiveModal(null)}>
           <div className="bg-white p-10 rounded-[2.5rem] w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
               <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-6 mx-auto"><Chrome size={32}/></div>
               <h2 className="text-3xl font-black mb-2 text-center text-slate-900">{authMode === 'signin' ? 'Welcome Back' : 'Create Account'}</h2>
               <p className="text-center text-slate-500 mb-8">Enter your details to access your creative space.</p>
               <form onSubmit={handleEmailAuth} className="space-y-4">
                   {authMode === 'signup' && <input placeholder="Full Name" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:border-purple-500 outline-none transition-colors font-medium" value={name} onChange={e => setName(e.target.value)} />}
                   <input placeholder="Email Address" type="email" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:border-purple-500 outline-none transition-colors font-medium" value={email} onChange={e => setEmail(e.target.value)} />
                   <input placeholder="Password" type="password" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:border-purple-500 outline-none transition-colors font-medium" value={password} onChange={e => setPassword(e.target.value)} />
                   <button className="w-full py-4 bg-slate-900 hover:bg-purple-600 text-white rounded-xl font-bold transition-colors shadow-lg shadow-purple-200">{authLoading ? 'Processing...' : (authMode === 'signin' ? 'Sign In' : 'Sign Up')}</button>
               </form>
               <div className="mt-6 flex items-center justify-center gap-4">
                   <div className="h-px bg-slate-200 flex-1"></div>
                   <span className="text-xs font-bold text-slate-400 uppercase">Or continue with</span>
                   <div className="h-px bg-slate-200 flex-1"></div>
               </div>
               <button onClick={handleGoogleLogin} className="w-full py-4 border border-slate-200 hover:bg-slate-50 mt-6 rounded-xl font-bold flex justify-center gap-3 text-slate-600 transition-colors"><Chrome size={20}/> Google Account</button>
           </div>
        </div>
      )}

      {/* Profile Settings Modal */}
      {activeModal === 'profile' && currentUser && (
        <ProfileSettings 
            user={currentUser}
            onClose={() => setActiveModal(null)}
            onSave={handleUpdateProfile}
        />
      )}
    </div>
  );
};

export default App;
