
import React from 'react';
import { User, ArrowRight } from 'lucide-react';
import { BlogPostData } from '../types';

interface BlogPostProps {
  post: BlogPostData;
  onRead: (post: BlogPostData) => void;
}

const BlogPost: React.FC<BlogPostProps> = ({ post, onRead }) => {
  return (
    <article className="group relative bg-white rounded-[3rem] overflow-hidden p-3 shadow-lg hover:shadow-2xl hover:shadow-indigo-200/50 border border-white/60 transition-all duration-500 flex flex-col md:flex-row gap-6 md:gap-10 hover:-translate-y-1">
      
      {/* Image Section */}
      {post.imageUrl && (
        <div className="w-full md:w-5/12 aspect-[4/3] md:aspect-auto relative overflow-hidden rounded-[2.5rem]">
          <div className="absolute inset-0 bg-slate-100 animate-pulse"></div>
          <img 
            src={post.imageUrl} 
            alt={post.title} 
            className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500"></div>
          
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            {post.tags?.slice(0, 2).map(tag => (
              <span key={tag} className="px-3 py-1 bg-white/90 backdrop-blur-sm text-slate-900 text-[10px] font-bold uppercase tracking-widest rounded-full shadow-sm">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Content Section */}
      <div className={`flex flex-col justify-center py-6 pr-6 md:py-8 ${!post.imageUrl ? 'w-full px-6' : 'md:w-7/12'}`}>
        
        <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
          <span className="text-indigo-500">{post.date}</span>
          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
          <span>{post.readTime}</span>
        </div>

        <h2 
          className="text-2xl md:text-4xl font-black text-slate-900 mb-4 leading-tight group-hover:text-indigo-600 transition-colors cursor-pointer"
          onClick={() => onRead(post)}
        >
          {post.title}
        </h2>

        <p className="text-slate-500 text-lg leading-relaxed mb-8 line-clamp-2 font-medium">
          {post.excerpt}
        </p>

        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-500 ring-2 ring-white shadow-sm">
               <User size={14} />
             </div>
             <span className="text-sm font-bold text-slate-700">{post.author}</span>
          </div>

          <button
            onClick={() => onRead(post)}
            className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all duration-300 shadow-sm"
          >
            <ArrowRight size={20} className="-ml-0.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </article>
  );
};

export default BlogPost;
