
import React from 'react';
import { Calendar, User, ArrowRight, Clock } from 'lucide-react';
import { BlogPostData } from '../types';

interface BlogPostProps {
  post: BlogPostData;
}

const BlogPost: React.FC<BlogPostProps> = ({ post }) => {
  return (
    <article className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 md:p-12 shadow-xl border border-white/60 mb-8 relative overflow-hidden group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
      
      <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm font-bold uppercase tracking-wider text-gray-400 mb-6">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-indigo-500" />
          <span>{post.date}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-purple-500" />
          <span>{post.readTime}</span>
        </div>
        <div className="flex items-center gap-2 bg-indigo-50 px-3 py-1 rounded-full text-indigo-600 ml-auto md:ml-0">
          <User size={16} />
          <span>{post.author}</span>
        </div>
      </div>

      <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-6 leading-tight bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent group-hover:from-indigo-600 group-hover:to-purple-600 transition-all duration-300">
        {post.title}
      </h2>

      <p className="text-lg md:text-xl text-gray-600 leading-relaxed mb-8 max-w-3xl line-clamp-3 md:line-clamp-none">
        {post.excerpt}
      </p>

      <a
        href={`#post-${post.id}`}
        className="inline-flex items-center gap-2 text-white font-semibold bg-gradient-to-br from-indigo-500 to-purple-600 px-8 py-4 rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-1 transition-all duration-300 group/btn"
      >
        <span>Read Article</span>
        <ArrowRight size={18} className="transition-transform group-hover/btn:translate-x-1" />
      </a>
    </article>
  );
};

export default BlogPost;
