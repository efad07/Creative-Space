import React from 'react';
import { ArrowRight, Box, Hash, User, Bookmark } from 'lucide-react';

interface SidebarProps {
  title: string;
  items: string[];
  icon?: React.ElementType;
}

const SidebarSection: React.FC<SidebarProps> = ({ title, items, icon: Icon }) => {
  return (
    <div className="mb-8 bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-white">
      <div className="flex items-center gap-3 mb-6">
        {Icon && <div className="p-2.5 bg-slate-50 rounded-2xl text-slate-600"><Icon size={18} /></div>}
        <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">
          {title}
        </h3>
      </div>
      
      {title.includes("Tags") ? (
        <div className="flex flex-wrap gap-2">
            {items.map((item, index) => (
                <a key={index} href="#" className="px-4 py-2 bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded-xl text-xs font-bold transition-all border border-slate-100 hover:border-indigo-100">
                    #{item}
                </a>
            ))}
        </div>
      ) : (
        <ul className="space-y-1">
            {items.map((item, index) => (
            <li key={index}>
                <a href="#" className="flex items-center justify-between text-slate-500 hover:text-indigo-600 transition-all font-semibold text-sm py-3 px-3 rounded-xl hover:bg-slate-50 group">
                <span>{item}</span>
                <ArrowRight size={14} className="text-slate-300 group-hover:text-indigo-600 transition-colors opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transform duration-300" />
                </a>
            </li>
            ))}
        </ul>
      )}
    </div>
  );
};

export const Sidebar: React.FC = () => {
  return (
    <aside className="h-full space-y-6">
      
      {/* About Card */}
      <div className="bg-slate-900 p-8 rounded-[2rem] text-white shadow-2xl shadow-slate-900/20 relative overflow-hidden group">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/30 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/30 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
        
        <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md">
                    <User size={18} />
                </div>
                <h3 className="font-bold text-lg">About Us</h3>
            </div>
            <p className="text-slate-300 font-medium leading-relaxed mb-8 text-sm">
            We curate the finest visual inspiration for designers, artists, and dreamers. Join our community today.
            </p>
            <button className="bg-white text-slate-900 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-indigo-50 transition-all w-full shadow-lg">
            Read More
            </button>
        </div>
      </div>
      
      <SidebarSection 
        title="Collections" 
        icon={Box}
        items={[
          "Architecture & Spaces",
          "Modern Interior",
          "Analog Photography",
          "Abstract Art",
          "Digital Nomads"
        ]} 
      />
      <SidebarSection 
        title="Trending Tags" 
        icon={Hash}
        items={[
          "Vibrant",
          "Minimalist",
          "Neon",
          "Urban",
          "Portrait",
          "Cyberpunk",
          "Nature",
          "Tech"
        ]} 
      />
    </aside>
  );
};

export default Sidebar;