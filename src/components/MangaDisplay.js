import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Search, Settings, ShieldCheck } from 'lucide-react';
import { ImageWithFallback } from '../utils';

const MangaDisplay = ({ user }) => {
  const [mangas, setMangas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  const fetchRealManga = async (search = '') => {
    setLoading(true);
    try {
      // ดึงข้อมูลจริงจาก MangaDex API
      const url = search 
        ? `https://api.mangadex.org/manga?title=${search}&limit=20&includes[]=cover_art`
        : `https://api.mangadex.org/manga?limit=20&includes[]=cover_art&order[followedCount]=desc`;
      
      const { data } = await axios.get(url);
      const formatted = data.data.map(m => {
        const coverFile = m.relationships.find(r => r.type === 'cover_art')?.attributes?.fileName;
        return {
          id: m.id,
          title: m.attributes.title.en || m.attributes.title.ja || 'No Title',
          cover: coverFile ? `https://uploads.mangadex.org/covers/${m.id}/${coverFile}.256.jpg` : null,
          isVIP: Math.random() > 0.8 // จำลอง VIP สำหรับเรื่องดัง
        };
      });
      setMangas(formatted);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { fetchRealManga(); }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 relative">
      {/* Floating Admin Button for Joshua */}
      {user?.isAdmin && (
        <Link to="/admin" className="fixed bottom-10 right-10 z-[100] bg-green-500 text-black p-4 rounded-full shadow-[0_0_20px_rgba(34,197,94,0.5)] flex items-center gap-2 font-black hover:scale-110 transition">
          <Settings size={24} className="animate-spin-slow" /> ADMIN PANEL
        </Link>
      )}

      <div className="max-w-xl mx-auto mb-16">
        <div className="relative">
          <input type="text" placeholder="Search real manga..." value={query} 
            onChange={e => setQuery(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && fetchRealManga(query)}
            className="w-full bg-gray-900/50 border border-white/10 py-4 pl-12 rounded-2xl outline-none focus:border-green-500 transition-all" />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
        {mangas.map(m => (
          <Link to={`/reader/${m.id}/1`} key={m.id} className="group">
            <div className="relative aspect-[3/4.5] rounded-3xl overflow-hidden shadow-2xl transition-transform group-hover:-translate-y-2">
              <ImageWithFallback src={m.cover} className="w-full h-full object-cover" />
              {m.isVIP && <div className="absolute top-3 left-3 bg-yellow-400 text-black text-[10px] font-black px-2 py-1 rounded-lg">👑 VIP</div>}
            </div>
            <h3 className="mt-4 font-bold text-sm line-clamp-2 group-hover:text-green-500 transition-colors">{m.title}</h3>
          </Link>
        ))}
      </div>
    </div>
  );
};
export default MangaDisplay;