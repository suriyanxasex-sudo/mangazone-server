import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Search, Flame, Star, TrendingUp, Info } from 'lucide-react';
import { ImageWithFallback } from '../utils';

const MangaDisplay = () => {
  const [mangas, setMangas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('manhwa');

  const fetchManga = useCallback(async (query = '') => {
    setLoading(true);
    try {
      // ใช้ API ออนไลน์ที่เสถียรที่สุด
      const endpoint = query 
        ? `https://api.jikan.moe/v4/manga?q=${query}&limit=25&order_by=popularity`
        : `https://api.jikan.moe/v4/top/manga?type=${activeTab}&limit=25`;
      
      const { data } = await axios.get(endpoint);
      setMangas(data.data);
    } catch (err) {
      console.error("API Error:", err);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchManga();
  }, [fetchManga]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Search Header Section */}
      <section className="mb-16 text-center">
        <h2 className="text-4xl font-black mb-6 bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
          Explore the Manga Universe
        </h2>
        <form 
          onSubmit={(e) => { e.preventDefault(); fetchManga(searchTerm); }}
          className="relative max-w-2xl mx-auto"
        >
          <input 
            type="text" 
            placeholder="Search manga, manhwa, or authors..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-900/40 border border-white/10 py-5 pl-14 pr-6 rounded-3xl outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all text-lg backdrop-blur-md"
          />
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" size={24} />
        </form>
      </section>

      {/* Categories & Filters */}
      <div className="flex items-center justify-between mb-10 border-b border-white/5 pb-4">
        <div className="flex gap-8">
          {['manhwa', 'manga', 'manhua'].map((tab) => (
            <button 
              key={tab}
              onClick={() => { setActiveTab(tab); setSearchTerm(''); }}
              className={`pb-4 text-sm font-bold tracking-widest uppercase transition-all ${activeTab === tab ? 'text-green-500 border-b-2 border-green-500' : 'text-gray-500 hover:text-white'}`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="hidden md:flex items-center gap-2 text-gray-500 text-sm">
          <TrendingUp size={16} /> Trending Today
        </div>
      </div>

      {/* Grid Display */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 animate-pulse">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="aspect-[3/4.5] bg-gray-900 rounded-3xl"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {mangas.map((m) => (
            <Link 
              to={`/reader/${m.mal_id}/1`} 
              key={m.mal_id} 
              className="group flex flex-col no-underline shadow-2xl"
            >
              <div className="relative aspect-[3/4.5] rounded-[2rem] overflow-hidden border border-white/5 transition-all duration-500 group-hover:-translate-y-3 group-hover:shadow-[0_20px_50px_rgba(34,197,94,0.15)]">
                <ImageWithFallback 
                  src={m.images.jpg.large_image_url} 
                  alt={m.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
                
                {/* VIP & Rating Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {m.score > 8.5 && (
                    <div className="bg-yellow-400 text-black text-[10px] font-black px-2 py-1 rounded-lg flex items-center gap-1">
                      <Star size={10} fill="black" /> VIP
                    </div>
                  )}
                </div>
                
                <div className="absolute bottom-4 left-4 right-4 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                  <p className="text-[10px] font-bold text-green-400 uppercase tracking-tighter mb-1">
                    {m.genres[0]?.name || 'Action'}
                  </p>
                  <h3 className="font-bold text-sm leading-tight line-clamp-2 text-white drop-shadow-md">
                    {m.title}
                  </h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default MangaDisplay;