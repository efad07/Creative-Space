import React, { useState, useMemo } from 'react';
import { X, Search, User, MapPin, ArrowRight } from 'lucide-react';
import { User as UserType } from '../types';

interface UserSearchModalProps {
  users: UserType[];
  onClose: () => void;
  onSelect: (user: UserType) => void;
}

const UserSearchModal: React.FC<UserSearchModalProps> = ({ users, onClose, onSelect }) => {
  const [query, setQuery] = useState('');

  const filteredUsers = useMemo(() => {
    if (!query) return users;
    const lower = query.toLowerCase();
    return users.filter(u => 
      u.name.toLowerCase().includes(lower) || 
      (u.bio && u.bio.toLowerCase().includes(lower)) ||
      (u.email && u.email.toLowerCase().includes(lower)) ||
      (u.location && u.location.toLowerCase().includes(lower))
    );
  }, [users, query]);

  return (
    <div className="fixed inset-0 z-[2000] bg-slate-900/60 backdrop-blur-md flex items-start justify-center p-4 pt-24 animate-in fade-in duration-300" onClick={onClose}>
      <div 
        className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative flex flex-col max-h-[80vh] overflow-hidden" 
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-100 flex items-center gap-4 bg-white z-10 shrink-0">
          <Search className="text-slate-400" size={24} />
          <input 
            autoFocus
            className="flex-1 text-xl font-bold text-slate-800 placeholder:text-slate-300 outline-none bg-transparent"
            placeholder="Search creators..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <button onClick={onClose} className="p-2 bg-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="overflow-y-auto p-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 px-2">
                {query ? `Found ${filteredUsers.length} Creator${filteredUsers.length !== 1 ? 's' : ''}` : 'Suggested Creators'}
            </h3>
            
            {filteredUsers.length === 0 ? (
                <div className="text-center py-12 text-slate-400 flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                        <Search size={32} />
                    </div>
                    <p>No creators found matching "{query}"</p>
                </div>
            ) : (
                <div className="grid gap-3">
                    {filteredUsers.map(user => (
                        <button 
                            key={user.email}
                            onClick={() => { onSelect(user); onClose(); }}
                            className="flex items-center gap-4 p-4 rounded-[1.5rem] hover:bg-slate-50 transition-colors text-left group border border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-md"
                        >
                            <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-white shadow-sm overflow-hidden shrink-0">
                                {user.avatar ? (
                                    <img src={user.avatar} className="w-full h-full object-cover" alt={user.name} />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                                        <User size={28} />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-slate-900 text-lg">{user.name}</h4>
                                <div className="flex items-center gap-3 text-xs font-bold text-slate-400 uppercase tracking-wide mt-1">
                                    {user.location && <span className="flex items-center gap-1 text-slate-500"><MapPin size={12}/> {user.location}</span>}
                                    {user.location && <span>•</span>}
                                    <span>{user.email.split('@')[0]}</span>
                                </div>
                                {user.bio && (
                                    <p className="text-slate-500 text-sm mt-2 line-clamp-1 font-medium leading-relaxed">{user.bio}</p>
                                )}
                            </div>
                            <div className="pr-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0 duration-300 text-purple-600">
                                <ArrowRight size={24} />
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default UserSearchModal;