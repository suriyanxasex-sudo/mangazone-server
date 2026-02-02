import React, { useState } from 'react';
import { api } from '../utils';
import { User, Lock, Mail, ShieldCheck, ArrowRight } from 'lucide-react';

const AuthScreen = ({ setUser }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsProcessing(true);

    try {
      const endpoint = isLogin ? '/login' : '/register';
      const { data } = await api.post(endpoint, formData);
      
      // บันทึกสิทธิ์ Joshua
      if (data.username.toLowerCase() === 'joshua') data.isAdmin = true;
      
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
    } catch (err) {
      setError(err.response?.data?.error || "Authentication failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative p-6 selection:bg-green-500/50">
      {/* Decorative Blur */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-[150px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[150px] animate-pulse delay-700"></div>
      </div>

      <div className="w-full max-w-lg relative">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-black tracking-tighter italic">
            MANGA<span className="text-green-500">ZONE</span>
          </h1>
          <p className="text-gray-500 font-medium mt-3 tracking-widest uppercase text-xs">The Digital Frontier for Manga Lovers</p>
        </div>

        <div className="bg-gray-900/40 backdrop-blur-3xl p-10 rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden">
          {/* Progress Bar */}
          {isProcessing && <div className="absolute top-0 left-0 h-1 bg-green-500 animate-progress w-full"></div>}

          <h2 className="text-2xl font-bold mb-8">{isLogin ? 'Sign In' : 'Create Account'}</h2>

          {error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-2xl text-red-400 text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase ml-2">Username</label>
              <div className="relative">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                <input 
                  type="text" 
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  className="w-full bg-black/60 border border-white/5 py-5 pl-14 pr-6 rounded-2xl outline-none focus:border-green-500 transition-all"
                  placeholder="Enter your username"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase ml-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                <input 
                  type="password" 
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full bg-black/60 border border-white/5 py-5 pl-14 pr-6 rounded-2xl outline-none focus:border-green-500 transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button 
              disabled={isProcessing}
              className="w-full bg-green-500 hover:bg-green-400 text-black font-black py-5 rounded-3xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-[0_10px_40px_rgba(34,197,94,0.3)] disabled:opacity-50"
            >
              {isLogin ? 'CONTINUE READING' : 'START JOURNEY'}
              <ArrowRight size={20} />
            </button>
          </form>

          <div className="mt-10 text-center">
            <button 
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="text-gray-400 hover:text-green-400 transition-colors text-sm font-medium"
            >
              {isLogin ? "New to MangaZone? Join the Community" : "Already a member? Sign in here"}
            </button>
          </div>
        </div>

        <div className="mt-10 flex justify-center gap-8 opacity-20 hover:opacity-100 transition-opacity duration-700">
          <ShieldCheck className="text-white" />
          <span className="text-xs font-bold tracking-widest flex items-center">SECURE DATA ENCRYPTION</span>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;