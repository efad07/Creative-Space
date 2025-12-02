
import React, { useRef, useState } from 'react';
import { User } from '../types';
import { Camera, Check, X, User as UserIcon, Lock, Globe, MapPin, AlignLeft, Shield, AlertCircle } from 'lucide-react';
import { changePassword } from '../db';

interface ProfileSettingsProps {
  user: User;
  onClose: () => void;
  onSave: (updates: Partial<User>) => Promise<void>;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ user, onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  
  // Profile State
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio || '');
  const [location, setLocation] = useState(user.location || '');
  const [website, setWebsite] = useState(user.website || '');
  const [avatar, setAvatar] = useState(user.avatar);
  const [error, setError] = useState<string | null>(null);
  
  // Password State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passMessage, setPassMessage] = useState({ text: '', type: '' });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 2MB Limit
    if (file.size > 2 * 1024 * 1024) {
      setError("Image is too large. Please select an image under 2MB.");
      return;
    }
    setError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setAvatar(event.target.result);
      }
    };
    reader.readAsDataURL(file);
    // Reset input so same file can be selected again if needed
    e.target.value = '';
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      setError("Display Name is required.");
      return;
    }
    setError(null);
    setLoading(true);
    
    try {
        await onSave({ 
          name, 
          avatar, 
          bio, 
          location, 
          website 
        });
        onClose();
    } catch (err) {
        console.error(err);
        setError("Failed to save profile. The image might be too large for browser storage.");
    } finally {
        setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      setPassMessage({ text: 'All fields are required', type: 'error' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassMessage({ text: 'New passwords do not match', type: 'error' });
      return;
    }
    if (newPassword.length < 6) {
      setPassMessage({ text: 'Password must be at least 6 characters', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      await changePassword(user.email, oldPassword, newPassword);
      setPassMessage({ text: 'Password updated successfully!', type: 'success' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (e: any) {
      setPassMessage({ text: e.message || 'Failed to update password', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={onClose}>
      <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col md:flex-row max-h-[90vh]" onClick={e => e.stopPropagation()}>
        
        {/* Sidebar */}
        <div className="w-full md:w-72 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-100 p-6 md:p-8 flex flex-col">
            <h2 className="text-2xl font-black text-slate-900 mb-8 px-2">Settings</h2>
            
            <nav className="space-y-2 flex-1">
              <button 
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all text-sm ${activeTab === 'profile' ? 'bg-white shadow-md text-purple-600' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}
              >
                <UserIcon size={18} /> Edit Profile
              </button>
              <button 
                onClick={() => setActiveTab('security')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all text-sm ${activeTab === 'security' ? 'bg-white shadow-md text-purple-600' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}
              >
                <Shield size={18} /> Password & Security
              </button>
            </nav>

            <div className="mt-8 px-4 py-4 bg-purple-50 rounded-2xl">
               <div className="flex items-center gap-3 mb-2">
                 <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-xs">
                    {user.name.charAt(0)}
                 </div>
                 <div className="overflow-hidden">
                   <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                   <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                 </div>
               </div>
            </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 md:p-10 overflow-y-auto">
           <button 
                onClick={onClose}
                className="absolute top-6 right-6 p-2 text-slate-300 hover:text-slate-600 transition-colors z-10"
            >
                <X size={24} />
            </button>

           {activeTab === 'profile' ? (
             <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                {error && (
                  <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 text-sm font-bold border border-red-100">
                    <AlertCircle size={20} />
                    {error}
                  </div>
                )}

                <div className="flex flex-col md:flex-row items-center gap-8">
                    {/* Avatar Upload */}
                    <div 
                        className="relative group cursor-pointer shrink-0"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <div className="w-32 h-32 rounded-full border-4 border-slate-50 shadow-xl overflow-hidden relative bg-slate-100">
                            {avatar ? (
                                <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                    <UserIcon size={48} />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <Camera className="text-white" size={32} />
                            </div>
                        </div>
                        <div className="absolute bottom-1 right-1 bg-purple-600 text-white p-2 rounded-full border-4 border-white shadow-lg pointer-events-none">
                            <Camera size={16} />
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/png, image/jpeg, image/webp" />
                    </div>

                    <div className="flex-1 w-full text-center md:text-left">
                        <h3 className="text-xl font-bold text-slate-900 mb-1">Profile Photo</h3>
                        <p className="text-slate-500 text-sm mb-4">Recommended: Square JPG, PNG. Max 2MB.</p>
                        <div className="flex gap-3 justify-center md:justify-start">
                            <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors">Upload New</button>
                            <button onClick={() => setAvatar(user.avatar)} className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors">Reset</button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Display Name</label>
                        <div className="relative">
                            <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input 
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-purple-500 outline-none transition-all font-semibold text-slate-800"
                                placeholder="Your Name"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Location</label>
                        <div className="relative">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input 
                                value={location}
                                onChange={e => setLocation(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-purple-500 outline-none transition-all font-semibold text-slate-800"
                                placeholder="City, Country"
                            />
                        </div>
                    </div>

                    <div className="col-span-1 md:col-span-2 space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Bio</label>
                        <div className="relative">
                            <AlignLeft className="absolute left-4 top-4 text-slate-400" size={18} />
                            <textarea 
                                value={bio}
                                onChange={e => setBio(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-purple-500 outline-none transition-all font-medium text-slate-800 min-h-[100px] resize-none"
                                placeholder="Tell the world a bit about yourself..."
                            />
                        </div>
                    </div>

                    <div className="col-span-1 md:col-span-2 space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Website</label>
                        <div className="relative">
                            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input 
                                value={website}
                                onChange={e => setWebsite(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-purple-500 outline-none transition-all font-semibold text-slate-800"
                                placeholder="https://yourwebsite.com"
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-4 flex justify-end">
                    <button 
                        onClick={handleSaveProfile}
                        disabled={loading}
                        className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-purple-200 flex items-center gap-2 active:scale-95 disabled:opacity-70 disabled:grayscale"
                    >
                        {loading ? 'Saving...' : <><Check size={18} /> Save Changes</>}
                    </button>
                </div>
             </div>
           ) : (
             <div className="space-y-8 animate-in slide-in-from-right-4 duration-300 max-w-lg">
                <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Change Password</h3>
                    <p className="text-slate-500 text-sm">Ensure your account is using a long, random password to stay secure.</p>
                </div>

                {passMessage.text && (
                    <div className={`p-4 rounded-xl text-sm font-bold flex items-center gap-2 ${passMessage.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                        {passMessage.type === 'error' ? <X size={16}/> : <Check size={16}/>}
                        {passMessage.text}
                    </div>
                )}

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Current Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input 
                                type="password"
                                value={oldPassword}
                                onChange={e => setOldPassword(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-purple-500 outline-none transition-all font-bold text-slate-800"
                            />
                        </div>
                    </div>
                    
                    <div className="h-px bg-slate-100 my-4"></div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">New Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input 
                                type="password"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-purple-500 outline-none transition-all font-bold text-slate-800"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Confirm New Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input 
                                type="password"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-purple-500 outline-none transition-all font-bold text-slate-800"
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-4 flex justify-end">
                    <button 
                        onClick={handleChangePassword}
                        disabled={loading}
                        className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all shadow-lg flex items-center gap-2 active:scale-95 disabled:opacity-70"
                    >
                        {loading ? 'Updating...' : 'Update Password'}
                    </button>
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
