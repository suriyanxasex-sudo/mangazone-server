import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ user, setUser, onOpenProfile, onOpenVIP }) => {
  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/';
  };

  return (
    <nav className="bg-gray-900 p-4 border-b border-gray-800 flex justify-between items-center sticky top-0 z-50">
      <Link to="/" className="text-2xl font-bold text-green-500 hover:text-green-400">MangaZone</Link>
      
      <div className="flex items-center gap-4">
        {user ? (
          <>
            {!user.isPremium && (
              <button onClick={onOpenVIP} className="bg-yellow-600 hover:bg-yellow-500 text-white text-sm px-3 py-1 rounded font-bold animate-pulse">
                Get VIP 👑
              </button>
            )}
            
            <div className="flex items-center gap-2 cursor-pointer" onClick={onOpenProfile}>
              {user.avatar ? (
                <img src={user.avatar} alt="Avatar" className="w-8 h-8 rounded-full object-cover border border-gray-600" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm font-bold">
                  {user.username.charAt(0).toUpperCase()}
                </div>
              )}
              <span className={`font-medium ${user.isPremium ? 'text-yellow-400' : 'text-gray-200'}`}>
                {user.username}
              </span>
            </div>
            
            <button onClick={handleLogout} className="text-red-400 hover:text-red-300 text-sm">Logout</button>
          </>
        ) : (
          <span className="text-gray-400">Guest</span>
        )}
      </div>
    </nav>
  );
};

export default Navbar;