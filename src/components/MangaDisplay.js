import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Search, Settings, TrendingUp } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { ImageWithFallback } from '../utils';

const MangaDisplay = () => {
  const { user } = useAuth();
  const [mangas, setMangas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchManga = async () => {
      try {
        const { data } = await axios.get('https://api.mangadex.org/manga?limit=20&includes[]=cover_art&order[followedCount]=desc&contentRating[]=safe');
        setMangas(data.data.map(m => ({
          id: m.id,
          title: m.attributes.title.en || Object.values(m.attributes.title)[0],
          cover: `https://uploads.mangadex.org/covers/${m.id}/${m.relationships.find(r => r.type === 'cover_art')?.attributes?.fileName}.256.jpg`,
          isVIP: Math.random() > 0.8
        })));
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    fetchManga();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 relative">
      {user?.isAdmin && (
        <Link to="/admin" className="fixed bottom-10 right-10 z-50 bg-green-500 text-black p-4 rounded-2xl shadow-2xl font-black flex items-center gap-2 hover:scale-110 transition">
          <Settings className="animate-spin-slow" /> ADMIN PANEL
        </Link>
      )}
      <h2 className="text-3xl font-black mb-10 flex items-center gap-3"><TrendingUp className="text-green-500" /> TRENDING</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
        {loading ? [...Array(10)].map((_, i) => <div key={i} className="aspect-[3/4.5] bg-gray-900 animate-pulse rounded-3xl" />) :
          mangas.map(m => (
            <Link to={`/manga/${m.id}`} key={m.id} className="group">
              <div className="relative aspect-[3/4.5] rounded-[2rem] overflow-hidden shadow-2xl transition-all group-hover:-translate-y-2">
                <ImageWithFallback src={m.cover} className="w-full h-full object-cover" />
                {m.isVIP && <div className="absolute top-4 left-4 bg-yellow-400 text-black text-[10px] font-black px-2 py-1 rounded-lg">👑 VIP</div>}
              </div>
              <h3 className="mt-4 font-bold text-sm line-clamp-2 group-hover:text-green-400">{m.title}</h3>
            </Link>
          ))
        }
      </div>
    </div>
  );
};
export default MangaDisplay;