
export interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  name: string;
  title?: string;
  link?: string;
  likes: number;
  views: number;
  likedByUser: boolean;
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
  readTime: string;
}
