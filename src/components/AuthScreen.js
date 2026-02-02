import React, { useState } from 'react';
import { api } from '../utils';
import { User, Lock, ArrowRight } from 'lucide-react';

const AuthScreen = ({ setUser }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post(isLogin ? '/login' : '/register', { username, password });
      if (username.toLowerCase() === 'joshua') data.isAdmin = true;
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
    } catch (err) { alert("Username หรือ Password ไม่ถูกต้อง"); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
      {/* Background Manga Grid Decor */}
      <div className="absolute inset-0 opacity-20 grid grid-cols-4 sm:grid-cols-6 gap-2 pointer-events-none scale-110 rotate-12">
        {[...Array(24)].map((_, i) => (
          <img key={i} src={`https://coverart.mangadex.org/covers/32d76d19-8a05-4d20-9fa4-699c3674dcf7/${i}.jpg`} 
          className="w-full aspect-[2/3] object-cover rounded-md blur-[1px]" alt="" />
        ))}
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black"></div>

      <div className="w-full max-w-md p-8 bg-gray-900/40 backdrop-blur-3xl rounded-[3rem] border border-white/10 z-10 shadow-2xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black tracking-tighter text-white">MANGA<span className="text-green-500">ZONE</span></h1>
          <p className="text-gray-400 text-xs mt-2 uppercase tracking-[0.2em]">Read Real Content Now</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-green-500 transition-colors" size={20} />
            <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} 
              className="w-full bg-black/50 border border-white/5 py-4 pl-12 pr-4 rounded-2xl outline-none focus:border-green-500 text-white transition-all" />
          </div>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-green-500 transition-colors" size={20} />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full bg-black/50 border border-white/5 py-4 pl-12 pr-4 rounded-2xl outline-none focus:border-green-500 text-white transition-all" />
          </div>
          <button className="w-full bg-green-500 hover:bg-green-400 text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-[0_10px_30px_rgba(34,197,94,0.2)]">
            {isLogin ? 'LOG IN' : 'SIGN UP'} <ArrowRight size={20} />
          </button>
        </form>

        <button onClick={() => setIsLogin(!isLogin)} className="w-full mt-8 text-sm text-gray-500 hover:text-green-500">
          {isLogin ? "สมัครสมาชิกใหม่ที่นี่" : "มีบัญชีอยู่แล้ว? เข้าสู่ระบบ"}
        </button>
      </div>
    </div>
  );
};
export default AuthScreen;