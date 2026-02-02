import React, { useState } from "react";
import { BookOpen, Search, LogOut, Shield } from "lucide-react";

export default function Navbar({ user, onSearch, setShowAdmin, onLogout, onReset, onOpenProfile }) {
   const [query, setQuery] = useState("");
   const handleSearchSubmit = (e) => { e.preventDefault(); if(query.trim().length > 0) onSearch(query); };

   return (
      <div className="fixed top-0 w-full z-50 p-4 px-6 flex justify-between items-center bg-black/90 backdrop-blur-md border-b border-gray-800 shadow-lg">
         <div className="flex items-center gap-2 cursor-pointer" onClick={onReset}>
            <BookOpen size={28} className="text-green-500"/><h1 className="text-2xl font-extrabold hidden md:block">Manga<span className="text-green-500">Zone</span></h1>
         </div>
         <form onSubmit={handleSearchSubmit} className="flex items-center bg-[#1e1e1e] border border-gray-700 rounded-full px-4 py-2 focus-within:border-green-500 transition w-full max-w-md mx-4">
             <button type="submit" className="text-gray-400 hover:text-green-500"><Search size={18} /></button>
             <input type="text" placeholder="Search..." className="bg-transparent border-none outline-none text-white text-sm ml-2 w-full" value={query} onChange={(e) => setQuery(e.target.value)} />
         </form>
         <div className="flex items-center gap-4">
             {user.isAdmin && <button onClick={() => setShowAdmin(true)} className="bg-blue-600/20 text-blue-400 border border-blue-600/50 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><Shield size={12}/> Admin</button>}
             <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-800 p-1 rounded-full pr-3 transition" onClick={onOpenProfile}>
                 <div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden border border-gray-500">
                    <img src={user.avatar || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"} className="w-full h-full object-cover" onError={(e) => e.target.src = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"}/>
                 </div>
                 <div className="hidden md:block text-left"><p className="text-xs font-bold text-white leading-none">{user.username}</p><p className={`text-[10px] leading-none mt-1 ${user.isPremium ? 'text-yellow-400' : 'text-gray-400'}`}>{user.isPremium ? "VIP" : "Free"}</p></div>
             </div>
             <button onClick={onLogout} className="text-gray-400 hover:text-red-500 transition p-1"><LogOut size={20}/></button>
         </div>
      </div>
   );
}