import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { api } from '../utils';
import { User as UserIcon, Lock, Zap } from 'lucide-react';

const AuthScreen = () => {
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post(isLogin ? '/login' : '/register', { username, password });
      login({
        username: data.username,
        isAdmin: data.isAdmin,
        isPremium: data.isPremium,
        token: data.token
      });
    } catch (err) { alert("Username หรือ Password ไม่ถูกต้อง"); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative">
      <div className="absolute inset-0 opacity-10 grid grid-cols-6 pointer-events-none rotate-12 scale-150">
        {[...Array(24)].map((_, i) => (
          <img key={i} src="https://uploads.mangadex.org/covers/32d76d19-8a05-4d20-9fa4-699c3674dcf7/1.jpg" alt="" className="rounded-xl" />
        ))}
      </div>
      
      <div className="w-full max-w-md p-10 bg-gray-900/50 backdrop-blur-3xl rounded-[3rem] border border-white/10 z-10">
        <div className="text-center mb-10">
          <Zap className="mx-auto text-green-500 mb-4" size={48} fill="currentColor" />
          <h1 className="text-4xl font-black text-white">MANGA<span className="text-green-500">ZONE</span></h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-black/40 border border-white/5 py-4 pl-12 pr-4 rounded-2xl outline-none focus:border-green-500 text-white" />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-black/40 border border-white/5 py-4 pl-12 pr-4 rounded-2xl outline-none focus:border-green-500 text-white" />
          </div>
          <button className="w-full bg-green-500 hover:bg-green-400 text-black font-black py-4 rounded-2xl shadow-lg transition-all active:scale-95">
            {isLogin ? 'ENTER ZONE' : 'JOIN ZONE'}
          </button>
        </form>
        <button onClick={() => setIsLogin(!isLogin)} className="w-full mt-6 text-gray-500 hover:text-green-500 text-sm">
          {isLogin ? "สมัครสมาชิกใหม่" : "มีบัญชีอยู่แล้ว? ล็อกอิน"}
        </button>
      </div>
    </div>
  );
};

export default AuthScreen;