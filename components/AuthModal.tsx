
import React, { useState } from 'react';
import { X, Mail, Lock, User, Chrome, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { User as UserType } from '../types';

interface AuthModalProps {
  initialMode: 'signin' | 'signup';
  onClose: () => void;
  onLogin: (email: string, pass: string) => Promise<UserType>;
  onRegister: (email: string, pass: string, name: string) => Promise<UserType>;
  onGoogleLogin: () => Promise<void>;
}

const AuthModal: React.FC<AuthModalProps> = ({ initialMode, onClose, onLogin, onRegister, onGoogleLogin }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'signup' && !formData.name.trim()) throw new Error("Name is required");
      if (!formData.email.includes('@')) throw new Error("Please enter a valid email");
      if (formData.password.length < 6) throw new Error("Password must be at least 6 characters");

      if (mode === 'signup') {
        await onRegister(formData.email, formData.password, formData.name);
      } else {
        await onLogin(formData.email, formData.password);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleClick = async () => {
    setError(null);
    setLoading(true);
    try {
      await onGoogleLogin();
      onClose();
    } catch (err: any) {
      setError("Google login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose}>
      <div 
        className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]" 
        onClick={e => e.stopPropagation()}
      >
        
        {/* Left Side: Visual (Hidden on mobile) */}
        <div className="hidden md:flex w-5/12 bg-slate-900 relative flex-col justify-between p-10 text-white overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-40">
            <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" className="w-full h-full object-cover" alt="Art" />
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/90 to-slate-900/90 mix-blend-multiply"></div>
          </div>
          
          <div className="relative z-10">
            <h3 className="text-3xl font-black tracking-tight mb-2">Creative Space</h3>
            <p className="text-purple-200 font-medium">Where inspiration lives.</p>
          </div>

          <div className="relative z-10">
            <blockquote className="text-lg font-medium italic leading-relaxed text-slate-200 mb-4">
              "Creativity takes courage."
            </blockquote>
            <p className="text-sm font-bold uppercase tracking-widest text-purple-400">— Henri Matisse</p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="flex-1 p-8 md:p-12 relative overflow-y-auto">
          <button onClick={onClose} className="absolute top-6 right-6 p-2 text-slate-300 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-50">
            <X size={24} />
          </button>

          <div className="max-w-sm mx-auto mt-4">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-black text-slate-900 mb-2">
                {mode === 'signin' ? 'Welcome Back' : 'Join the Community'}
              </h2>
              <p className="text-slate-500 font-medium">
                {mode === 'signin' ? 'Enter your details to access your account.' : 'Start your creative journey today.'}
              </p>
            </div>

            {error && (
              <div className="mb-6 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2 animate-in slide-in-from-top-2">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div className="space-y-1.5">
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Full Name</label>
                   <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="text" 
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-purple-500 outline-none transition-all font-semibold text-slate-900 placeholder:text-slate-400"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                      />
                   </div>
                </div>
              )}

              <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="email" 
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-purple-500 outline-none transition-all font-semibold text-slate-900 placeholder:text-slate-400"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
              </div>

              <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="password" 
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-purple-500 outline-none transition-all font-semibold text-slate-900 placeholder:text-slate-400"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={e => setFormData({...formData, password: e.target.value})}
                    />
                  </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 bg-slate-900 hover:bg-purple-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-purple-900/20 flex items-center justify-center gap-2 mt-2 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 size={20} className="animate-spin" /> : (
                  <>
                    {mode === 'signin' ? 'Sign In' : 'Create Account'} <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 flex items-center justify-center gap-4">
               <div className="h-px bg-slate-100 flex-1"></div>
               <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Or continue with</span>
               <div className="h-px bg-slate-100 flex-1"></div>
            </div>

            <button 
              onClick={handleGoogleClick}
              disabled={loading}
              className="w-full py-3.5 border border-slate-200 hover:bg-slate-50 mt-6 rounded-xl font-bold flex justify-center items-center gap-3 text-slate-600 transition-colors active:scale-95 disabled:opacity-50"
            >
              <Chrome size={20} className="text-red-500" /> Google Account
            </button>

            <p className="text-center mt-8 text-sm font-medium text-slate-500">
              {mode === 'signin' ? "Don't have an account? " : "Already have an account? "}
              <button 
                onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null); }}
                className="text-purple-600 hover:text-purple-800 font-bold hover:underline"
              >
                {mode === 'signin' ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
