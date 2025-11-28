import React from 'react';
import { ArrowRight, Box, Hash, User } from 'lucide-react';

interface SidebarProps {
  title: string;
  items: string[];
  icon?: React.ElementType;
}

const SidebarSection: React.FC<SidebarProps> = ({ title, items, icon: Icon }) => {
  return (
    <div className="mb-10 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
      <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
        {Icon && <Icon size={18} className="text-violet-500" />}
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">
          {title}
        </h3>
      </div>
      <ul className="space-y-3">
        {items.map((item, index) => (
          <li key={index} className="group">
            <a href="#" className="flex items-center justify-between text-slate-500 hover:text-violet-600 transition-colors font-medium text-sm">
              <span>{item}</span>
              <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-violet-50 transition-colors">
                <ArrowRight size={12} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-violet-600" />
              </div>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export const Sidebar: React.FC = () => {
  return (
    <aside className="h-full">
      <div className="bg-gradient-to-br from-violet-600 to-fuchsia-600 p-8 rounded-3xl mb-10 text-white shadow-xl shadow-violet-500/20">
        <h3 className="font-bold text-2xl mb-3">About Us</h3>
        <p className="text-white/90 font-medium leading-relaxed mb-6 text-sm">
          We curate the finest visual inspiration for designers, artists, and dreamers. Join our community today.
        </p>
        <button className="bg-white text-violet-600 px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-violet-50 transition-colors">
          Read More
        </button>
      </div>
      
      <SidebarSection 
        title="Collections" 
        icon={Box}
        items={[
          "Architecture & Spaces",
          "Modern Interior",
          "Analog Photography",
          "Abstract Art"
        ]} 
      />
      <SidebarSection 
        title="Trending Tags" 
        icon={Hash}
        items={[
          "Vibrant",
          "Minimalist",
          "Neon",
          "Urban"
        ]} 
      />
    </aside>
  );
};

export default Sidebar;