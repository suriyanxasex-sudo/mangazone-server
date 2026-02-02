import React, { useState } from 'react';
import { api } from '../utils';

const AuthScreen = ({ setUser }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // ✅ ส่งข้อมูลไป Render
      const { data } = await api.post(isLogin ? '/login' : '/register', { 
        username, 
        password,
        isAdmin: username === 'joshua' // ถ้าสมัครด้วยชื่อ joshua ให้เป็นแอดมิน
      });

      // 🔥 เช็คสถานะอีกรอบก่อนเซฟ
      if (data.username === 'joshua') data.isAdmin = true;

      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
    } catch (err) { 
      setError(err.response?.data?.error || "Error: ล็อกอินไม่ได้"); 
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="bg-gray-900 p-8 rounded-xl border border-gray-800 w-80 text-center">
        <h2 className="text-3xl font-bold text-green-500 mb-6">MangaZone</h2>
        {error && <p className="text-red-500 text-xs mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} className="w-full p-2 rounded bg-gray-800 text-white outline-none" />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-2 rounded bg-gray-800 text-white outline-none" />
          <button className="w-full bg-green-600 py-2 rounded font-bold hover:bg-green-700 transition">
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>
        <button onClick={() => setIsLogin(!isLogin)} className="mt-4 text-xs text-gray-500 hover:text-green-400">
          {isLogin ? "สมัครสมาชิกใหม่" : "กลับไปหน้าล็อกอิน"}
        </button>
      </div>
    </div>
  );
};
export default AuthScreen;