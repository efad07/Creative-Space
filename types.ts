
export interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  name: string;
  title?: string;
  description?: string;
  link?: string;
  category?: string; // New feature: Category support
  likes: number;
  views: number;
  likedByUser: boolean;
  // Author info
  userId?: string;
  authorName?: string;
  authorAvatar?: string;
  // Optional blob for storage handling
  blob?: Blob;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error';
}

export interface HeaderConfig {
  title: string;
  description: string;
  photoUrl: string | null;
}

export interface BlogPostData {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  authorAvatar?: string;
  readTime: string;
  content?: string;
  imageUrl?: string;
  tags?: string[];
  timestamp?: number; // Added for 24h expiration logic
  userId?: string;
  link?: string; // Added for story external links
}

export interface User {
  name: string;
  email: string;
  avatar?: string;
  password?: string; // Only used internally for auth checks
  bio?: string;
  location?: string;
  website?: string;
}
