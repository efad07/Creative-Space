
import React from 'react';
import { Search, X, User as UserIcon, ArrowRight } from 'lucide-react';
import { User } from '../types';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  matchedUsers?: User[];
  onSelectUser?: (user: User) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, matchedUsers = [], onSelectUser }) => {
  return (
    <div className="relative mb-8 group z-30">
      <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search for articles, users, or topics..."
        className="block w-full pl-12 pr-12 py-4 bg-white/90 backdrop-blur-xl border border-white/60 rounded-2xl shadow-lg focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder-gray-400 text-gray-700 font-medium text-lg"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors hover:scale-110 active:scale-95"
          aria-label="Clear search"
        >
          <X className="h-5 w-5" />
        </button>
      )}

      {/* User Search Results Dropdown */}
      {value && matchedUsers.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-3 bg-white/90 backdrop-blur-xl border border-white/50 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">Accounts Found</h4>
                  <div className="space-y-1">
                      {matchedUsers.map(user => (
                          <button 
                            key={user.email}
                            onClick={() => onSelectUser && onSelectUser(user)}
                            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-indigo-50 transition-colors group/item text-left"
                          >
                              <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                                  {user.avatar ? (
                                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                  ) : (
                                      <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold"><UserIcon size={16}/></div>
                                  )}
                              </div>
                              <div className="flex-1 min-w-0">
                                  <h5 className="font-bold text-slate-800 text-sm truncate group-hover/item:text-indigo-700">{user.name}</h5>
                                  <p className="text-xs text-slate-500 truncate">{user.bio || user.email}</p>
                              </div>
                              <ArrowRight size={16} className="text-slate-300 group-hover/item:text-indigo-500 -translate-x-2 group-hover/item:translate-x-0 transition-all opacity-0 group-hover/item:opacity-100" />
                          </button>
                      ))}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default SearchBar;
