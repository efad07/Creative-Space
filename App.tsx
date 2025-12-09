
import React, { useState, useCallback, useEffect, useRef } from 'react';
import Header from './components/Header';
import MediaGallery from './components/MediaGallery';
import Lightbox from './components/Lightbox';
import Toast from './components/Toast';
import SearchBar from './components/SearchBar';
import GoogleAd from './components/GoogleAd';
import StoryViewer from './components/StoryViewer';
import ProfileSettings from './components/ProfileSettings';
import AuthModal from './components/AuthModal';
import PrivacyPolicy from './components/PrivacyPolicy';
import AboutModal from './components/AboutModal';
import ContactModal from './components/ContactModal';
import TermsModal from './components/TermsModal';
import UserSearchModal from './components/UserSearchModal';
import ShareModal from './components/ShareModal';
import { MediaItem, ToastMessage, HeaderConfig, User, BlogPostData, Comment } from './types';
import { LogOut, ArrowLeft, Heart, Grid, List, Plus, Settings, Link as LinkIcon, Check, X, Twitter, Instagram, Linkedin, Facebook, MapPin, Globe, User as UserIcon, Users, Share2 } from 'lucide-react';
import { saveMediaItemToDB, getMediaItemsFromDB, deleteMediaItemFromDB, saveConfigToDB, getConfigFromDB, deleteUserMediaFromDB, registerUser, authenticateUser, updateUser, saveUserToDB, getAllUsers } from './db';

// Sample Data for Blog with Timestamps for Expiration Logic
const INITIAL_STORIES: BlogPostData[] = [
  {
    id: '1',
    title: 'The Art of Minimalist Photography',
    excerpt: 'Discover how less can be more.',
    date: 'Today',
    author: 'Elena Fisher',
    readTime: '5 min',
    imageUrl: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    tags: ['Photography'],
    content: `<p>Full content...</p>`,
    timestamp: Date.now()
  },
  {
    id: '2',
    title: 'Color Theory in Digital Design',
    excerpt: 'Understanding the psychological impact of color.',
    date: 'Today',
    author: 'Marcus Chen',
    readTime: '8 min',
    imageUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    tags: ['Design'],
    content: `<p>Full content...</p>`,
    timestamp: Date.now() - 3600000 // 1 hour ago
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
  const [allUsers, setAllUsers] = useState<User[]>([]); // User Database for Search
  const [lightboxState, setLightboxState] = useState<{ isOpen: boolean; index: number }>({
    isOpen: false,
    index: 0
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [activeModal, setActiveModal] = useState<'auth' | 'profile' | 'privacy' | 'about' | 'contact' | 'terms' | 'userSearch' | null>(null);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  
  // Share Modal State
  const [shareData, setShareData] = useState<{ url: string, title: string, text: string } | null>(null);
  
  // Story States
  const [stories, setStories] = useState<BlogPostData[]>(INITIAL_STORIES);
  const [activeStory, setActiveStory] = useState<BlogPostData | null>(null); // For Reading
  const [viewingStoryIndex, setViewingStoryIndex] = useState<number | null>(null); // For Story Player
  const [watchedStories, setWatchedStories] = useState<string[]>([]);
  const storyInputRef = useRef<HTMLInputElement>(null);
  
  // Story Upload Modal States
  const [showStoryUploadModal, setShowStoryUploadModal] = useState(false);
  const [tempStoryImg, setTempStoryImg] = useState<string | null>(null);
  const [newStoryTitle, setNewStoryTitle] = useState('');
  const [newStoryLink, setNewStoryLink] = useState('');

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeNav, setActiveNav] = useState('All');
  
  // New Filter & View States
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // User Profile Viewing State
  const [selectedUserProfile, setSelectedUserProfile] = useState<User | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);

  // Track ObjectURLs to revoke them on unmount to prevent memory leaks
  const objectUrlsRef = useRef<string[]>([]);

  // --- Derived State for Stories (24h Expiration) ---
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  const activeStories = stories.filter(story => {
    // If no timestamp, assume it's valid (or could assume invalid, but legacy support implies valid)
    if (!story.timestamp) return true;
    return (Date.now() - story.timestamp) < ONE_DAY_MS;
  });

  // Scroll Reveal Observer
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.1 });

    // Delay slightly to ensure DOM is ready
    setTimeout(() => {
      document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    }, 500);

    return () => observer.disconnect();
  }, [mediaItems, activeNav, viewMode, activeCategory, selectedUserProfile]);

  // --- Initialization ---
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedUser = localStorage.getItem('creative_space_user');
        if (savedUser) setCurrentUser(JSON.parse(savedUser));
        
        const savedConfig = await getConfigFromDB();
        if (savedConfig) setHeaderConfig(savedConfig);
        
        const savedMedia = await getMediaItemsFromDB();
        
        // Track URLs created by getMediaItemsFromDB for cleanup
        savedMedia.forEach(item => {
            if (item.url.startsWith('blob:')) {
                objectUrlsRef.current.push(item.url);
            }
        });

        setMediaItems(savedMedia);

        // Load all users for search
        const users = await getAllUsers();
        setAllUsers(users);
        
        // Load watched stories
        const savedWatched = localStorage.getItem('creative_space_watched_stories');
        if(savedWatched) setWatchedStories(JSON.parse(savedWatched));

        // Load custom stories if any (Persistence Logic)
        const savedStories = localStorage.getItem('creative_space_stories');
        if(savedStories) {
            setStories(JSON.parse(savedStories));
        }
      } catch (error) {
        console.error("Failed to load data", error);
      } finally {
        // Add a small artificial delay for the splash screen effect
        setTimeout(() => setIsLoading(false), 800);
      }
    };
    loadData();

    // Cleanup function to release memory when app unmounts
    return () => {
        objectUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
        objectUrlsRef.current = [];
    };
  }, []);

  // --- Deep Link Handler ---
  useEffect(() => {
    if (!isLoading && mediaItems.length > 0) {
        const params = new URLSearchParams(window.location.search);
        const itemId = params.get('item');
        const userEmail = params.get('user');

        if (itemId) {
            // If deep linking to an item, ensure we are in a state to see it
            setActiveNav('All');
            setActiveCategory('All');
            setSearchQuery('');
            setSelectedUserProfile(null);
            
            const index = mediaItems.findIndex(i => i.id === itemId);
            if (index !== -1) {
                setLightboxState({ isOpen: true, index });
                showToast("Shared item loaded!", 'success');
            } else {
                showToast("Item not found or private", 'error');
            }
        } else if (userEmail) {
             const user = allUsers.find(u => u.email === userEmail);
             if (user) {
                 setSelectedUserProfile(user);
                 showToast(`Viewing ${user.name}'s profile`, 'success');
             } else {
                 showToast("User not found", 'error');
             }
        }
        
        // Clean URL after handling to prevent loop/stuck state
        if (itemId || userEmail) {
            window.history.replaceState(null, '', window.location.pathname);
        }
    }
  }, [isLoading, mediaItems.length, allUsers.length]);

  // Sync users when registered
  const refreshUsers = async () => {
      try {
          const users = await getAllUsers();
          setAllUsers(users);
      } catch (e) { console.error(e); }
  }

  // Helper to persist stories
  const saveStoriesToLocal = (newStories: BlogPostData[]) => {
      setStories(newStories);
      try {
          // Limit storage usage by only storing recent ones if needed, but for now allow all
          localStorage.setItem('creative_space_stories', JSON.stringify(newStories));
      } catch (e) {
          console.error("Failed to save stories locally (quota?)", e);
      }
  };

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
    
    // Add new blob URLs to our tracking ref
    newItems.forEach(item => {
        if (item.url.startsWith('blob:')) {
            objectUrlsRef.current.push(item.url);
        }
    });

    const itemsWithUser = newItems.map(item => ({
      ...item,
      userId: authorInfo.email,
      authorName: authorInfo.name,
      authorAvatar: authorInfo.avatar,
      comments: []
    }));
    
    setMediaItems((prev) => [...prev, ...itemsWithUser]);
    for (const item of itemsWithUser) {
        if (item.url && item.url.startsWith('blob:')) {
            try {
                // We fetch the blob from the objectURL to store it in DB
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
    setMediaItems(prev => prev.filter(item => {
        if (item.id === id && item.url.startsWith('blob:')) {
            URL.revokeObjectURL(item.url); // Release memory immediately
        }
        return item.id !== id;
    }));
    await deleteMediaItemFromDB(id);
    showToast('Item deleted', 'success');
  };

  const clearAllMedia = async () => {
    if (!currentUser?.email) return;
    
    setMediaItems(prev => {
        const remaining: MediaItem[] = [];
        prev.forEach(item => {
            if (item.userId === currentUser.email) {
                if (item.url.startsWith('blob:')) URL.revokeObjectURL(item.url);
            } else {
                remaining.push(item);
            }
        });
        return remaining;
    });

    await deleteUserMediaFromDB(currentUser.email);
    showToast('Gallery cleared', 'success');
  };

  const handleSaveItem = async (item: MediaItem) => {
    if (!currentUser) {
        showToast('Please sign in to save items', 'error');
        setAuthMode('signin');
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
        comments: [],
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
            const updated = { 
                ...item, 
                likedByUser: isLiked,
                likes: isLiked ? item.likes + 1 : item.likes - 1
            };
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

  // --- Comment & Share Handlers ---
  const handleAddComment = (itemId: string, text: string) => {
    if (!currentUser) {
        showToast('Please sign in to comment', 'error');
        setAuthMode('signin');
        setActiveModal('auth');
        return;
    }
    const newComment: Comment = {
        id: Math.random().toString(36).substr(2, 9),
        text,
        userId: currentUser.email,
        userName: currentUser.name,
        userAvatar: currentUser.avatar,
        timestamp: Date.now()
    };

    setMediaItems(prev => prev.map(item => {
        if (item.id === itemId) {
            const updated = { ...item, comments: [...(item.comments || []), newComment] };
            saveMediaItemToDB(updated);
            return updated;
        }
        return item;
    }));
    showToast('Comment added', 'success');
  };

  const handleDeleteComment = (itemId: string, commentId: string) => {
      setMediaItems(prev => prev.map(item => {
          if (item.id === itemId && item.comments) {
              const updated = { ...item, comments: item.comments.filter(c => c.id !== commentId) };
              saveMediaItemToDB(updated);
              return updated;
          }
          return item;
      }));
      showToast('Comment deleted', 'success');
  };

  const handleShare = async (item?: MediaItem) => {
      let shareUrl = window.location.origin + window.location.pathname;
      let title = 'Creative Space';
      let text = 'Check out this amazing creative community!';

      if (item) {
          shareUrl = `${shareUrl}?item=${item.id}`;
          title = item.title || 'Check this out!';
          text = `Check out this amazing content by ${item.authorName} on Creative Space.`;
      } else if (selectedUserProfile) {
          shareUrl = `${shareUrl}?user=${selectedUserProfile.email}`;
          title = `${selectedUserProfile.name} on Creative Space`;
          text = `Check out ${selectedUserProfile.name}'s portfolio on Creative Space.`;
      }

      // 1. Try Native Share first (Mobile/Tablet)
      if (navigator.share) {
        try {
          await navigator.share({
            title: title,
            text: text,
            url: shareUrl,
          });
          return;
        } catch (error) {
          console.log('Error sharing:', error);
          // Fallback to modal if native share is cancelled or fails
        }
      }

      // 2. Fallback to Modal (Desktop/Unsupported)
      setShareData({ url: shareUrl, title, text });
  };

  const handleStoryOpen = (index: number) => {
    setViewingStoryIndex(index);
    // Use activeStories to ensure index match
    const storyId = activeStories[index].id;
    if (!watchedStories.includes(storyId)) {
        const newWatched = [...watchedStories, storyId];
        setWatchedStories(newWatched);
        localStorage.setItem('creative_space_watched_stories', JSON.stringify(newWatched));
    }
  };

  // 1. Initial File Select -> Open Modal
  const handleStoryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!currentUser) {
        showToast('Please sign in to post stories', 'error');
        setAuthMode('signin');
        setActiveModal('auth');
        return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
        if (typeof event.target?.result === 'string') {
            setTempStoryImg(event.target.result);
            setNewStoryTitle('');
            setNewStoryLink('');
            setShowStoryUploadModal(true);
        }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // 2. Finalize Upload from Modal
  const finalizeStoryUpload = () => {
      if (!tempStoryImg) return;
      
      const authorInfo = getCurrentAuthorInfo();
      const newStory: BlogPostData = {
          id: Math.random().toString(36).substr(2, 9),
          title: newStoryTitle || 'New Story',
          excerpt: newStoryTitle || 'Just posted a new story!',
          date: 'Just now',
          author: authorInfo.name,
          authorAvatar: authorInfo.avatar,
          userId: authorInfo.email,
          readTime: '1 min',
          imageUrl: tempStoryImg,
          tags: ['Story'],
          content: '<p>New story update...</p>',
          timestamp: Date.now(),
          link: newStoryLink || undefined
      };

      const updatedStories = [newStory, ...stories];
      saveStoriesToLocal(updatedStories);
      
      setShowStoryUploadModal(false);
      setTempStoryImg(null);
      showToast('Your story has been added!', 'success');
  };

  const handleDeleteStory = (storyId: string) => {
    const updatedStories = stories.filter(s => s.id !== storyId);
    saveStoriesToLocal(updatedStories);
    showToast('Story deleted', 'success');
  }

  const handleUpdateStory = (storyId: string, updates: Partial<BlogPostData>) => {
    const updatedStories = stories.map(s => s.id === storyId ? {...s, ...updates} : s);
    saveStoriesToLocal(updatedStories);
    showToast('Story updated', 'success');
  }

  const getDisplayedItems = () => {
    let items = mediaItems;

    if (selectedUserProfile) {
        // If viewing a user profile, filter strictly by that user
        items = items.filter(item => item.userId === selectedUserProfile.email);
        // Also apply search query within that profile
        if (searchQuery) items = items.filter(item => (item.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()));
    } else {
        // Default Logic
        if (activeNav === 'My Gallery' && currentUser) items = items.filter(item => item.userId === currentUser.email);
        
        // Search Filter (for global feed)
        // If searching users, the SearchBar dropdown handles navigation, but we also filter posts by title/author text
        if (searchQuery) {
            items = items.filter(item => (item.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) || item.name.toLowerCase().includes(searchQuery.toLowerCase()));
        }
    }
    
    // Category is always applied
    if (activeCategory !== 'All') items = items.filter(item => item.category === activeCategory);
    
    return items;
  };

  const displayedItems = getDisplayedItems();

  // Search logic for Users
  const matchedUsers = searchQuery 
    ? allUsers.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const handleUserSelect = (user: User) => {
      // Switch view mode first to clear current state
      setActiveNav('All');
      // Then set user
      setSelectedUserProfile(user);
      setSearchQuery(''); // Clear search to show full profile
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Auth Handlers
  const handleAuthClick = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    setActiveModal('auth');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('creative_space_user');
    setActiveNav('All');
    setSelectedUserProfile(null);
    showToast('Logged out', 'success');
  };

  const onGoogleLogin = async () => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const user = { name: "Google User", email: "google@user.com", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Google" };
      try {
        await saveUserToDB(user);
        await refreshUsers();
      } catch (e) {
        console.error("Failed to sync Google user to DB", e);
      }
      
      setCurrentUser(user);
      localStorage.setItem('creative_space_user', JSON.stringify(user));
      showToast('Signed in with Google', 'success');
  };

  const onEmailLogin = async (email: string, pass: string) => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      const user = await authenticateUser(email, pass);
      setCurrentUser(user);
      localStorage.setItem('creative_space_user', JSON.stringify(user));
      showToast('Welcome back!', 'success');
      return user;
  };

  const onEmailRegister = async (email: string, pass: string, name: string) => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      const user = await registerUser(email, pass, name);
      await refreshUsers();
      setCurrentUser(user);
      localStorage.setItem('creative_space_user', JSON.stringify(user));
      showToast('Account created successfully!', 'success');
      return user;
  };
  
  const handleUpdateProfile = async (updates: Partial<User>) => {
      if (!currentUser) return;
      try {
          let updatedUser;
          try {
             updatedUser = await updateUser(currentUser.email, updates);
          } catch (dbError: any) {
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
          } catch {
             throw new Error("Storage full. Image likely too large.");
          }
          setCurrentUser(updatedUser);
          await refreshUsers();

          // --- SYNC UPDATE: Update all previous posts by this user ---
          if (updates.avatar || updates.name) {
             const newName = updatedUser.name;
             const newAvatar = updatedUser.avatar;

             setMediaItems(prev => prev.map(item => {
                 if (item.userId === currentUser.email) {
                     const updatedItem = { ...item, authorName: newName, authorAvatar: newAvatar };
                     saveMediaItemToDB(updatedItem);
                     return updatedItem;
                 }
                 return item;
             }));

             // Update stories and persist
             const updatedStories = stories.map(story => {
                if (story.userId === currentUser.email) {
                    return { ...story, author: newName, authorAvatar: newAvatar };
                }
                return story;
             });
             saveStoriesToLocal(updatedStories);
          }

          showToast('Profile updated successfully', 'success');
      } catch (e: any) {
          console.error(e);
          showToast(e.message || 'Failed to update profile', 'error');
          throw e; 
      }
  };

  // Switch Main Content based on State
  const handleNavChange = (nav: string) => {
      setActiveNav(nav);
      setSelectedUserProfile(null); // Clear specific user view when nav changes
      setSearchQuery('');
  };

  if (isLoading) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-900 z-[9999]">
      <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4"></div>
      <h2 className="text-white text-xl font-bold animate-pulse">Loading Creative Space...</h2>
    </div>
  );

  return (
    <div className="min-h-screen text-slate-900 font-sans selection:bg-purple-200 selection:text-purple-900 relative overflow-x-hidden">
      <Toast toasts={toasts} removeToast={removeToast} />
      
      {/* Floating Navigation */}
      <nav className="fixed top-6 inset-x-0 mx-auto w-fit z-[100] glass-panel shadow-2xl shadow-purple-900/10 rounded-full px-3 py-2 flex justify-center items-center gap-1 transition-all duration-300 max-w-[95%] animate-fade-up">
        <button onClick={() => handleNavChange('All')} className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all active:scale-95 ${activeNav === 'All' && !selectedUserProfile ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'}`}>All</button>
        {currentUser && <button onClick={() => handleNavChange('My Gallery')} className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all active:scale-95 ${activeNav === 'My Gallery' && !selectedUserProfile ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'}`}>My Gallery</button>}
        
        <button onClick={() => setActiveModal('userSearch')} className="px-4 py-2.5 rounded-full text-sm font-bold text-slate-500 hover:text-purple-600 hover:bg-white/50 transition-all flex items-center gap-2 active:scale-95">
          <Users size={16}/> <span className="hidden sm:inline">Creators</span>
        </button>

        {/* Added Policy Links to Nav for AdSense Compliance */}
        <div className="hidden lg:flex items-center gap-1 mx-2">
            <button onClick={() => setActiveModal('about')} className="px-3 py-2 rounded-full text-xs font-bold text-slate-500 hover:text-purple-600 hover:bg-white/50 transition-all">About</button>
            <button onClick={() => setActiveModal('privacy')} className="px-3 py-2 rounded-full text-xs font-bold text-slate-500 hover:text-purple-600 hover:bg-white/50 transition-all">Privacy</button>
            <button onClick={() => setActiveModal('terms')} className="px-3 py-2 rounded-full text-xs font-bold text-slate-500 hover:text-purple-600 hover:bg-white/50 transition-all">Terms</button>
            <button onClick={() => setActiveModal('contact')} className="px-3 py-2 rounded-full text-xs font-bold text-slate-500 hover:text-purple-600 hover:bg-white/50 transition-all">Contact</button>
        </div>

        <div className="w-px h-6 bg-slate-200/50 mx-2 hidden sm:block"></div>

        {currentUser ? (
           <div className="flex items-center gap-2 pr-1 pl-1">
             <div 
                className="w-9 h-9 rounded-full overflow-hidden border-2 border-white shadow-sm cursor-pointer hover:ring-2 hover:ring-purple-400 transition-all bg-slate-200 hover:scale-110 active:scale-90"
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
             <button onClick={() => setActiveModal('profile')} className="p-2 text-slate-400 hover:text-slate-700 transition-colors hover:rotate-90 active:scale-90 duration-500" title="Settings">
                 <Settings size={18} />
             </button>
             <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-500 transition-colors hover:scale-110 active:scale-90" title="Logout"><LogOut size={18} /></button>
           </div>
        ) : (
          <div className="flex items-center gap-1 pl-1 pr-1">
             <button onClick={() => handleAuthClick('signin')} className="px-5 py-2.5 rounded-full text-sm font-bold text-slate-600 hover:text-purple-600 transition-all hover:bg-white/50 active:scale-95">Sign In</button>
             <button onClick={() => handleAuthClick('signup')} className="px-6 py-2.5 rounded-full text-sm font-bold bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:opacity-90 transition-all shadow-lg shadow-purple-500/20 active:scale-95 hover:-translate-y-0.5">Sign Up</button>
          </div>
        )}
      </nav>

      {/* Header - Only Show on Main Feed */}
      {!selectedUserProfile && (
        <Header 
            config={headerConfig} 
            onUpdatePhoto={updateHeaderPhoto}
            onUpdateInfo={updateHeaderInfo}
            onShowToast={showToast}
        />
      )}

      {/* Main Container - Adjusted padding top when header is hidden */}
      <main className={`max-w-[1400px] mx-auto px-4 md:px-8 ${selectedUserProfile ? 'pt-32 pb-12' : 'py-12'} animate-in fade-in slide-in-from-bottom-8 duration-700`}>
        
        {/* User Profile View Header */}
        {selectedUserProfile && (
            <div className="mb-12 animate-fade-up">
                 <button onClick={() => setSelectedUserProfile(null)} className="mb-8 flex items-center gap-2 px-4 py-2 bg-white rounded-full font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm active:scale-95">
                     <ArrowLeft size={18} /> Back to Feed
                 </button>
                 
                 <div className="bg-white/60 backdrop-blur-xl border border-white/60 rounded-[3rem] p-8 md:p-12 shadow-xl flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12 relative overflow-hidden group">
                     {/* Decorative background blur */}
                     <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                     {/* Profile Share Button */}
                     <button 
                         onClick={() => handleShare()}
                         className="absolute top-8 right-8 p-3 bg-white/50 hover:bg-white rounded-full text-slate-500 hover:text-purple-600 transition-all shadow-sm border border-slate-100/50"
                         title="Share Profile"
                     >
                         <Share2 size={20} />
                     </button>

                     <div className="w-32 h-32 md:w-40 md:h-40 rounded-full p-1 bg-gradient-to-br from-purple-500 to-pink-500 shadow-xl shrink-0">
                         <div className="w-full h-full rounded-full border-4 border-white overflow-hidden bg-white">
                             {selectedUserProfile.avatar ? (
                                 <img src={selectedUserProfile.avatar} alt={selectedUserProfile.name} className="w-full h-full object-cover" />
                             ) : (
                                 <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                                     <UserIcon size={48} />
                                 </div>
                             )}
                         </div>
                     </div>
                     
                     <div className="text-center md:text-left flex-1 min-w-0">
                         <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-2">{selectedUserProfile.name}</h1>
                         {selectedUserProfile.location && (
                             <div className="flex items-center justify-center md:justify-start gap-2 text-slate-500 font-bold mb-4">
                                 <MapPin size={16} /> {selectedUserProfile.location}
                             </div>
                         )}
                         <p className="text-lg text-slate-600 font-medium leading-relaxed max-w-2xl mb-6">
                             {selectedUserProfile.bio || "No bio yet."}
                         </p>
                         
                         <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                             <div className="px-6 py-3 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center md:items-start min-w-[100px]">
                                 <span className="text-2xl font-black text-slate-900">{mediaItems.filter(i => i.userId === selectedUserProfile.email).length}</span>
                                 <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Posts</span>
                             </div>
                             {selectedUserProfile.website && (
                                 <a href={selectedUserProfile.website} target="_blank" rel="noreferrer" className="px-6 py-3 bg-indigo-50 text-indigo-600 rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-100 transition-colors">
                                     <Globe size={18} /> Website
                                 </a>
                             )}
                         </div>
                     </div>
                 </div>
            </div>
        )}

        {/* Story Tray (Only on main feed) */}
        {!selectedUserProfile && (
            <div className="mb-12 overflow-x-auto no-scrollbar py-4 -mx-4 px-4 md:mx-0 md:px-0 reveal">
            <div className="flex gap-4 min-w-max">
                {/* My Story (Add) - Only visible in My Gallery */}
                {activeNav === 'My Gallery' && (
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
                    <div className="w-20 h-20 rounded-full bg-slate-100 border-2 border-white shadow-md flex items-center justify-center relative group-hover:scale-105 transition-transform duration-300">
                        <div className="absolute inset-0 rounded-full overflow-hidden opacity-60">
                            <img src={currentUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${(currentUser?.name || 'guest').replace(/\s/g, '')}`} className="w-full h-full object-cover" />
                        </div>
                        <div className="absolute bottom-0 right-0 w-6 h-6 bg-purple-600 rounded-full border-2 border-white flex items-center justify-center text-white z-10 shadow-sm animate-bounce">
                            <Plus size={14} strokeWidth={3}/>
                        </div>
                    </div>
                    <span className="text-xs font-semibold text-slate-500 group-hover:text-purple-600 transition-colors">Your Story</span>
                    </div>
                )}

                {/* Other Stories */}
                {activeStories.map((story, index) => {
                const isWatched = watchedStories.includes(story.id);
                return (
                    <div key={story.id} className="flex flex-col items-center gap-2 cursor-pointer group" onClick={() => handleStoryOpen(index)}>
                    <div className={`w-20 h-20 rounded-full p-[3px] group-hover:scale-110 transition-transform duration-500 ${isWatched ? 'bg-slate-200' : 'bg-gradient-to-tr from-yellow-400 via-orange-500 to-fuchsia-600 animate-[spin_10s_linear_infinite] hover:animate-none'}`}>
                        <div className="w-full h-full rounded-full border-2 border-white overflow-hidden bg-white relative">
                            <img src={story.imageUrl} className="w-full h-full object-cover" />
                        </div>
                    </div>
                    <span className="text-xs font-semibold text-slate-600 max-w-[80px] truncate group-hover:text-slate-900 transition-colors">{story.author.split(' ')[0]}</span>
                    </div>
                );
                })}
            </div>
            </div>
        )}

        {/* Leaderboard Ad */}
        <div className="w-full flex justify-center mb-16 reveal">
          <GoogleAd 
            className="w-full max-w-[970px] h-[90px] md:h-[250px] shadow-sm hover:shadow-lg transition-shadow duration-500" 
            slot="1234567890" 
            format="horizontal" 
          />
        </div>

        {/* Main Content Area */}
        <div className="w-full">
            <div className="mb-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 reveal">
                <div>
                    <h2 className="text-5xl font-black text-slate-900 mb-3 tracking-tight">
                    {selectedUserProfile ? 'Portfolio' : (activeNav === 'My Gallery' ? 'My Collections' : 'Community Feed')}
                    </h2>
                    <p className="text-slate-500 font-medium text-lg">
                    {selectedUserProfile 
                        ? `Explore ${selectedUserProfile.name}'s latest work.` 
                        : (activeNav === 'My Gallery' ? 'Manage your personal uploads.' : 'Discover inspiring work from creators worldwide.')}
                    </p>
                </div>
                {/* View Toggle */}
                {activeNav !== 'Stories' && (
                    <div className="flex bg-white/50 backdrop-blur-md rounded-2xl p-1 border border-white shadow-sm hover:shadow-md transition-shadow">
                        <button onClick={() => setViewMode('grid')} className={`p-2.5 rounded-xl transition-all active:scale-95 ${viewMode === 'grid' ? 'bg-white shadow-md text-purple-600' : 'text-slate-400 hover:text-slate-600'}`}><Grid size={20}/></button>
                        <button onClick={() => setViewMode('list')} className={`p-2.5 rounded-xl transition-all active:scale-95 ${viewMode === 'list' ? 'bg-white shadow-md text-purple-600' : 'text-slate-400 hover:text-slate-600'}`}><List size={20}/></button>
                    </div>
                )}
            </div>

            <div className="space-y-6 reveal">
                <SearchBar 
                    value={searchQuery} 
                    onChange={setSearchQuery} 
                    matchedUsers={matchedUsers} 
                    onSelectUser={handleUserSelect}
                />
                
                {/* Categories Filter Bar */}
                {activeNav !== 'Stories' && (
                    <div className="flex overflow-x-auto pb-4 gap-3 no-scrollbar items-center">
                        {['All', 'Photography', 'Art', 'Design', 'Tech', 'Lifestyle'].map((cat, idx) => (
                            <button 
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                style={{ animationDelay: `${idx * 100}ms` }}
                                className={`animate-fade-up opacity-0 px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all border active:scale-95 ${
                                    activeCategory === cat 
                                    ? 'bg-slate-900 text-white border-slate-900 shadow-lg scale-105' 
                                    : 'bg-white/40 border-slate-200 text-slate-600 hover:bg-white hover:border-purple-300 hover:text-purple-600 hover:shadow-md'
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
            {!selectedUserProfile && (
                <div className="reveal">
                    <GoogleAd className="w-full h-[120px] mb-12 shadow-sm" slot="0987654321" format="horizontal" />
                </div>
            )}

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
                onAddComment={handleAddComment}
                onShare={handleShare}
                onSelectUser={handleUserSelect}
                currentUser={currentUser}
                allowUpload={selectedUserProfile ? (currentUser?.email === selectedUserProfile.email) : (activeNav === 'My Gallery')}
                viewMode={viewMode}
            />
        </div>
      </main>

      {/* SEO / Publisher Content Section for AdSense */}
      {!selectedUserProfile && (
        <section className="w-full bg-white border-y border-slate-100 py-16 reveal">
            <div className="max-w-4xl mx-auto px-6 prose prose-lg prose-slate text-slate-600">
                <h2 className="text-3xl font-black text-slate-900 mb-6">Empowering the Next Generation of Visual Storytellers</h2>
                <p>
                    Creative Space is more than just a digital gallery; it is a global ecosystem designed to connect, inspire, and elevate artists from every corner of the world. In an era where visual content dominates communication, having a dedicated platform that prioritizes quality, aesthetic integrity, and community engagement is essential. Our mission is to bridge the gap between emerging talent and global recognition, providing a seamless interface where photographers, digital artists, and designers can showcase their portfolios in high definition.
                </p>
                
                <h3 className="text-2xl font-bold text-slate-900 mt-8 mb-4">A Curated Sanctuary for Digital Art</h3>
                <p>
                    Unlike traditional social media platforms where content is fleeting, Creative Space focuses on the longevity and impact of visual art. Our curation algorithms and community-driven filtering ensure that every visit provides a fresh dose of inspiration. From the raw emotion of analog photography to the precision of modern 3D rendering and the fluidity of motion graphics, our gallery encompasses a diverse spectrum of creative disciplines. We believe that art should not be confined by borders, which is why our infrastructure is built to support creators from Dhaka to New York, ensuring fast, responsive access to high-resolution media regardless of location.
                </p>

                <h3 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Technology Meets Creativity</h3>
                <p>
                    Built with cutting-edge web technologies, Creative Space offers a fluid, app-like experience directly in the browser. We utilize advanced image optimization, responsive grid layouts, and immersive lightbox features to present artwork as the artist intended. Our commitment to user experience extends to privacy and security, ensuring that while we foster open sharing, we also protect the intellectual property and personal data of our users. Whether you are a professional seeking a portfolio solution or an enthusiast looking for daily inspiration, Creative Space provides the tools and environment necessary to thrive in the digital creative economy.
                </p>
            </div>
        </section>
      )}

      {/* Footer Ad */}
      <div className="max-w-[1200px] mx-auto px-4 mb-8 reveal">
        <GoogleAd className="w-full h-[200px]" slot="5555555555" format="auto" />
      </div>

      <footer className="bg-slate-50 border-t border-slate-200 pt-20 pb-12 reveal">
        <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                {/* Brand Column */}
                <div className="col-span-1 md:col-span-1">
                    <h3 className="text-3xl font-black gradient-text mb-4 inline-block">{headerConfig.title}</h3>
                    <p className="text-slate-500 font-medium text-sm leading-relaxed mb-6">
                        Empowering creators worldwide to share their vision. Join the global community of visual storytellers today.
                    </p>
                    <div className="flex gap-4">
                        <a href="#" className="p-2 bg-white rounded-full text-slate-400 hover:text-purple-600 hover:scale-110 transition-all shadow-sm border border-slate-100">
                            <Twitter size={18} />
                        </a>
                        <a href="#" className="p-2 bg-white rounded-full text-slate-400 hover:text-pink-600 hover:scale-110 transition-all shadow-sm border border-slate-100">
                            <Instagram size={18} />
                        </a>
                        <a href="#" className="p-2 bg-white rounded-full text-slate-400 hover:text-blue-600 hover:scale-110 transition-all shadow-sm border border-slate-100">
                            <Linkedin size={18} />
                        </a>
                        <a href="#" className="p-2 bg-white rounded-full text-slate-400 hover:text-blue-800 hover:scale-110 transition-all shadow-sm border border-slate-100">
                            <Facebook size={18} />
                        </a>
                    </div>
                </div>

                {/* Company Column */}
                <div>
                    <h4 className="font-bold text-slate-900 text-lg mb-6">Company</h4>
                    <ul className="space-y-3 text-sm font-medium text-slate-500">
                        <li><button onClick={() => setActiveModal('about')} className="hover:text-purple-600 transition-colors">About Us</button></li>
                        <li><a href="#" className="hover:text-purple-600 transition-colors">Careers</a></li>
                        <li><a href="#" className="hover:text-purple-600 transition-colors">Blog</a></li>
                        <li><a href="#" className="hover:text-purple-600 transition-colors">Press Kit</a></li>
                    </ul>
                </div>

                {/* Legal Column */}
                <div>
                    <h4 className="font-bold text-slate-900 text-lg mb-6">Legal</h4>
                    <ul className="space-y-3 text-sm font-medium text-slate-500">
                        <li><button onClick={() => setActiveModal('privacy')} className="hover:text-purple-600 transition-colors">Privacy Policy</button></li>
                        <li><button onClick={() => setActiveModal('terms')} className="hover:text-purple-600 transition-colors">Terms of Service</button></li>
                        <li><a href="#" className="hover:text-purple-600 transition-colors">Cookie Policy</a></li>
                        <li><a href="#" className="hover:text-purple-600 transition-colors">Copyright</a></li>
                    </ul>
                </div>

                {/* Support Column */}
                <div>
                    <h4 className="font-bold text-slate-900 text-lg mb-6">Support</h4>
                    <ul className="space-y-3 text-sm font-medium text-slate-500">
                        <li><button onClick={() => setActiveModal('contact')} className="hover:text-purple-600 transition-colors">Contact Us</button></li>
                        <li><a href="#" className="hover:text-purple-600 transition-colors">Help Center</a></li>
                        <li><a href="#" className="hover:text-purple-600 transition-colors">Community Guidelines</a></li>
                        <li><a href="#" className="hover:text-purple-600 transition-colors">Report Abuse</a></li>
                    </ul>
                </div>
            </div>

            <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">© 2025 Creative Space Studio. All rights reserved.</p>
                <div className="flex gap-6 text-xs font-bold text-slate-400 uppercase tracking-widest">
                    <span>Dhaka, Bangladesh</span>
                    <span>•</span>
                    <span>English (US)</span>
                </div>
            </div>
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
        onAddComment={handleAddComment}
        onDeleteComment={handleDeleteComment}
        onShare={handleShare}
        onSelectUser={handleUserSelect}
        currentUser={currentUser}
      />
      
      {/* Immersive Story Viewer */}
      {viewingStoryIndex !== null && (
        <StoryViewer 
            stories={activeStories} 
            initialIndex={viewingStoryIndex} 
            onClose={() => setViewingStoryIndex(null)}
            onReadMore={(story) => {
                setViewingStoryIndex(null);
                setActiveStory(story);
            }}
            currentUser={currentUser}
            onDelete={handleDeleteStory}
            onUpdate={handleUpdateStory}
        />
      )}

      {/* Story Upload Modal */}
      {showStoryUploadModal && tempStoryImg && (
        <div className="fixed inset-0 z-[2000] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
           <div className="bg-white rounded-[2rem] w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
              <div className="p-6">
                 <h3 className="text-2xl font-black text-slate-900 mb-6">New Story</h3>
                 <div className="aspect-[9/16] w-32 rounded-xl overflow-hidden shadow-lg mx-auto mb-6 bg-slate-100 border border-slate-200">
                    <img src={tempStoryImg} className="w-full h-full object-cover" />
                 </div>
                 
                 <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Title / Caption</label>
                        <input 
                           value={newStoryTitle}
                           onChange={e => setNewStoryTitle(e.target.value)}
                           className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-purple-500 outline-none font-semibold transition-all focus:ring-4 focus:ring-purple-500/10"
                           placeholder="Add a caption..."
                           autoFocus
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Link (Optional)</label>
                        <div className="relative">
                            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input 
                               value={newStoryLink}
                               onChange={e => setNewStoryLink(e.target.value)}
                               className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-purple-500 outline-none font-medium text-sm transition-all focus:ring-4 focus:ring-purple-500/10"
                               placeholder="https://..."
                            />
                        </div>
                    </div>
                 </div>

                 <div className="flex gap-3 mt-8">
                     <button onClick={finalizeStoryUpload} className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-purple-200 active:scale-95"><Check size={18}/> Post Story</button>
                     <button onClick={() => {setShowStoryUploadModal(false); setTempStoryImg(null);}} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 active:scale-95"><X size={18}/> Cancel</button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Story Reader Modal (Long Form) */}
      {activeStory && (
        <div className="fixed inset-0 z-[100] bg-white overflow-y-auto animate-in slide-in-from-bottom-10 duration-500">
           <div className="sticky top-0 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-4 flex justify-between items-center z-10">
              <button onClick={() => setActiveStory(null)} className="flex items-center gap-2 font-bold text-slate-600 hover:text-purple-600 bg-slate-50 px-4 py-2 rounded-full hover:bg-purple-50 transition-colors active:scale-95"><ArrowLeft size={20}/> Back</button>
              <div className="flex gap-2"><button className="p-3 rounded-full bg-slate-50 hover:bg-pink-50 hover:text-pink-500 transition-all hover:scale-110 active:scale-90"><Heart size={20}/></button></div>
           </div>
           <article className="max-w-3xl mx-auto px-6 py-16 animate-fade-up">
              <div className="flex gap-3 mb-6">
                {activeStory.tags?.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-xs font-bold uppercase">{tag}</span>
                ))}
              </div>
              <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-8 leading-tight">{activeStory.title}</h1>
              {activeStory.imageUrl && <img src={activeStory.imageUrl} className="w-full rounded-[2.5rem] shadow-2xl mb-12 hover:scale-[1.01] transition-transform duration-700" />}
              <div className="prose prose-xl prose-slate mx-auto">
                <p className="text-2xl text-slate-600 font-medium leading-relaxed mb-8">{activeStory.excerpt}</p>
                <div dangerouslySetInnerHTML={{ __html: activeStory.content || '' }} />
              </div>
           </article>
        </div>
      )}

      {/* Auth Modal (New) */}
      {activeModal === 'auth' && (
        <AuthModal 
          initialMode={authMode}
          onClose={() => setActiveModal(null)}
          onLogin={onEmailLogin}
          onRegister={onEmailRegister}
          onGoogleLogin={onGoogleLogin}
        />
      )}

      {/* Profile Settings Modal */}
      {activeModal === 'profile' && currentUser && (
        <ProfileSettings 
            user={currentUser}
            onClose={() => setActiveModal(null)}
            onSave={handleUpdateProfile}
        />
      )}

      {/* Privacy Policy Modal */}
      {activeModal === 'privacy' && (
        <PrivacyPolicy onClose={() => setActiveModal(null)} />
      )}
      
      {/* New Modals */}
      {activeModal === 'about' && <AboutModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'contact' && <ContactModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'terms' && <TermsModal onClose={() => setActiveModal(null)} />}
      
      {/* User Search Modal */}
      {activeModal === 'userSearch' && (
        <UserSearchModal 
            users={allUsers}
            onClose={() => setActiveModal(null)}
            onSelect={handleUserSelect}
        />
      )}

      {/* Share Modal */}
      {shareData && (
        <ShareModal 
            url={shareData.url}
            title={shareData.title}
            text={shareData.text}
            onClose={() => setShareData(null)}
        />
      )}
    </div>
  );
};

export default App;
