import React, { useState, useEffect } from "react";
import { ChevronRight, Crown, Lock, ChevronLeft, Loader } from "lucide-react";
import { JIKAN_URL, ImageWithFallback, isMangaPremium } from "../utils";

const GENRES = [
    { id: 1, name: 'Action' }, { id: 2, name: 'Adventure' }, { id: 4, name: 'Comedy' },
    { id: 8, name: 'Drama' }, { id: 10, name: 'Fantasy' }, { id: 14, name: 'Horror' },
    { id: 22, name: 'Romance' }, { id: 24, name: 'Sci-Fi' }, { id: 30, name: 'Sports' },
    { id: 62, name: 'Isekai' }
];

export function GenreBar({ onSelect, selectedId }) {
    return (
        <div className="flex gap-3 overflow-x-auto px-4 pb-4 scrollbar-hide relative z-20">
            <button onClick={() => onSelect(null)} className={`whitespace-nowrap px-5 py-2 rounded-full font-bold text-sm transition shadow-lg ${!selectedId ? 'bg-green-600 text-white shadow-green-900/50' : 'bg-[#1e1e1e]/90 border border-gray-700 text-gray-300 hover:bg-white hover:text-black'}`}>All / Home</button>
            {GENRES.map(g => (
                <button key={g.id} onClick={() => onSelect(g)} className={`whitespace-nowrap px-5 py-2 rounded-full font-bold text-sm transition shadow-lg ${selectedId === g.id ? 'bg-green-600 text-white shadow-green-900/50' : 'bg-[#1e1e1e]/90 border border-gray-700 text-gray-300 hover:bg-white hover:text-black'}`}>{g.name}</button>
            ))}
        </div>
    );
}

export function SectionGrid({ title, endpoint, onRead, onClose }) {
    const [mangas, setMangas] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
       setLoading(true);
       fetch(`${JIKAN_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}limit=24`)
         .then(r=>r.json())
         .then(d => { setMangas(d.data || []); setLoading(false); })
         .catch(() => setLoading(false));
    }, [endpoint]);
    
    return (
       <div className="fixed inset-0 bg-[#121212] z-50 overflow-y-auto animate-fade-in pt-24 px-4 md:px-8 text-white">
          <div className="flex items-center gap-4 mb-8 max-w-7xl mx-auto">
              <button onClick={onClose} className="bg-gray-800 p-2 rounded-full hover:bg-white/20 transition"><ChevronLeft/></button>
              <h2 className="text-3xl font-bold flex items-center gap-2">{title}</h2>
          </div>
          <div className="max-w-7xl mx-auto pb-10">
             {loading ? <div className="flex flex-col items-center justify-center h-64 text-gray-500"><Loader className="animate-spin mb-4 text-green-500" size={40}/><p>Searching...</p></div> : 
             mangas.length === 0 ? <div className="text-center text-gray-500 mt-10"><p className="text-xl">No results.</p></div> :
             <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {mangas.map(m => {
                    const isPremium = isMangaPremium(m);
                    return (
                        <div key={m.mal_id} onClick={() => onRead(m, isPremium)} className="cursor-pointer group relative">
                            <div className="relative overflow-hidden rounded-xl shadow-lg aspect-[2/3]">
                                <ImageWithFallback src={m.images?.jpg?.large_image_url} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                                {isPremium && <div className="absolute top-2 right-2 bg-yellow-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm"><Lock size={10}/> VIP</div>}
                            </div>
                            <p className="text-gray-200 text-sm mt-3 font-semibold truncate group-hover:text-green-400 transition">{m.title}</p>
                        </div>
                    );
                })}
             </div>}
          </div>
       </div>
    );
}

export function Row({ title, endpoint, onRead, onSeeMore, delay }) {
    const [mangas, setMangas] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { 
        const timer = setTimeout(() => {
            setLoading(true);
            fetch(`${JIKAN_URL}${endpoint}&limit=10`)
                .then(r => r.json())
                .then(d => { setMangas(d.data || []); setLoading(false); })
                .catch(() => setLoading(false));
        }, delay * 1000); 
        return () => clearTimeout(timer);
    }, [endpoint, delay]);

    if (loading) return (
        <div className="animate-pulse mb-10 px-4 relative z-20">
            <div className="h-8 w-48 bg-gray-800/50 rounded mb-4"></div>
            <div className="flex gap-4 overflow-hidden">{[1,2,3,4].map(i => <div key={i} className="w-32 h-48 bg-gray-800/50 rounded-lg flex-shrink-0"></div>)}</div>
        </div>
    );
    if (!mangas.length) return null;

    return (
      <div className="animate-fade-in-up mb-12 px-4 relative z-20">
         <div className="flex items-center gap-2 mb-4 border-l-4 border-green-500 pl-3 cursor-pointer group w-fit" onClick={() => onSeeMore(title, endpoint)}>
             <h2 className="text-xl font-bold text-white group-hover:text-green-400 transition drop-shadow-md">{title}</h2>
             <ChevronRight size={20} className="text-gray-500 group-hover:text-green-400 transition"/>
         </div>
         <div className="flex overflow-x-scroll gap-4 pb-4 scrollbar-hide">
            {mangas.map(m => {
               const isPremium = isMangaPremium(m);
               return (
                <div key={m.mal_id} onClick={() => onRead(m, isPremium)} className="relative flex-shrink-0 cursor-pointer w-32 md:w-40 group">
                    <div className="relative shadow-lg rounded-lg">
                        <ImageWithFallback src={m.images?.jpg?.large_image_url} className="w-full h-48 md:h-60 object-cover rounded-lg group-hover:scale-105 transition duration-300" />
                        {isPremium && <div className="absolute top-2 right-2 bg-yellow-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm"><Lock size={10}/> VIP</div>}
                    </div>
                    <p className="mt-2 text-xs text-gray-300 truncate group-hover:text-green-400 font-medium">{m.title}</p>
                </div>
               );
            })}
         </div>
      </div>
    );
}