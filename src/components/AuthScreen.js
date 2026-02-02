import React, { useState } from 'react';
import { api } from '../utils';

const AuthScreen = ({ setUser }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/login' : '/register';
      const { data } = await api.post(endpoint, { username, password });

      localStorage.setItem('user', JSON.stringify(data));
      if (setUser) setUser(data);
      window.location.reload(); 

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Connection Error: ติดต่อ Server ไม่ได้");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
      <div className="bg-gray-900 p-8 rounded-lg shadow-lg w-full max-w-md border border-gray-800">
        <h2 className="text-3xl font-bold mb-6 text-center text-green-500">MangaZone</h2>
        <h3 className="text-xl mb-4 text-center">{isLogin ? 'Login' : 'Create Account'}</h3>
        
        {error && <div className="bg-red-500/20 text-red-400 p-3 rounded mb-4 text-center border border-red-500/50">{error}</div>}
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} className="p-3 rounded bg-gray-800 border border-gray-700 text-white" required />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="p-3 rounded bg-gray-800 border border-gray-700 text-white" required />
          <button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded disabled:opacity-50">
            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
          </button>
        </form>
        
        <p className="mt-6 text-center text-gray-400">
          <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="text-green-400 hover:underline font-bold">
            {isLogin ? 'Switch to Sign Up' : 'Switch to Login'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthScreen;