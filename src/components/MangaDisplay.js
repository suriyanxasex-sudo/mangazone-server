import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Star, 
  Flame,
  TrendingUp,
  Clock,
  Heart,
  Shield
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import { ImageWithFallback, api } from '../utils';

const MangaDisplay = () => {
  const { user } = useAuth();
  const [mangas, setMangas] = useState([]);
  const [filteredMangas, setFilteredMangas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Categories
  const categories = [
    { id: 'all', name: 'ทั้งหมด', icon: '📚' },
    { id: 'action', name: 'แอคชั่น', icon: '💥' },
    { id: 'romance', name: 'โรแมนซ์', icon: '💕' },
    { id: 'fantasy', name: 'แฟนตาซี', icon: '✨' },
    { id: 'comedy', name: 'คอมเมดี้', icon: '😂' },
    { id: 'drama', name: 'ดราม่า', icon: '🎭' },
    { id: 'vip', name: 'VIP Only', icon: '👑' },
    { id: 'new', name: 'ใหม่ล่าสุด', icon: '🆕' },
  ];

  // Fetch manga from MangaDex API
  const fetchManga = useCallback(async (pageNum = 1) => {
    setLoading(true);
    try {
      const limit = 20;
      const offset = (pageNum - 1) * limit;
      
      const { data } = await axios.get('https://api.mangadex.org/manga', {
        params: {
          limit,
          offset,
          includes: ['cover_art'],
          order: { followedCount: 'desc' },
          contentRating: ['safe', 'suggestive'],
          availableTranslatedLanguage: ['th', 'en']
        }
      });

      const formattedMangas = data.data.map(manga => {
        const attributes = manga.attributes;
        const coverArt = manga.relationships.find(r => r.type === 'cover_art');
        
        return {
          id: manga.id,
          title: attributes.title.en || 
                Object.values(attributes.title)[0] || 
                'ไม่มีชื่อ',
          description: attributes.description?.en || 
                      attributes.description?.th || 
                      'ไม่มีคำอธิบาย',
          cover: coverArt ? 
                `https://uploads.mangadex.org/covers/${manga.id}/${coverArt.attributes.fileName}.512.jpg` : 
                null,
          rating: Math.round((attributes.contentRating === 'safe' ? 4 : 3.5) + Math.random()),
          chapters: Math.floor(Math.random() * 100) + 1,
          status: attributes.status || 'ongoing',
          year: attributes.year || 2023,
          isVIP: Math.random() > 0.7,
          isNew: Math.random() > 0.8,
          genres: attributes.tags?.slice(0, 3).map(tag => tag.attributes.name.en) || []
        };
      });

      if (pageNum === 1) {
        setMangas(formattedMangas);
      } else {
        setMangas(prev => [...prev, ...formattedMangas]);
      }

      setHasMore(formattedMangas.length === limit);
      setError('');
    } catch (err) {
      console.error('Error fetching manga:', err);
      setError('ไม่สามารถโหลดข้อมูลมังงะได้');
      
      // Fallback data
      const fallbackData = generateFallbackManga();
      setMangas(fallbackData);
    } finally {
      setLoading(false);
    }
  }, []);

  // Generate fallback manga data
  const generateFallbackManga = () => {
    const titles = [
      'Solo Leveling', 'One Piece', 'Naruto', 'Demon Slayer',
      'Jujutsu Kaisen', 'Attack on Titan', 'My Hero Academia',
      'Black Clover', 'Chainsaw Man', 'Spy x Family'
    ];
    
    return titles.map((title, index) => ({
      id: `fallback-${index}`,
      title,
      description: 'มังงะเรื่องดังที่คุณไม่ควรพลาด',
      cover: `https://picsum.photos/400/600?random=${index}`,
      rating: 4 + Math.random(),
      chapters: Math.floor(Math.random() * 200) + 50,
      status: Math.random() > 0.5 ? 'ongoing' : 'completed',
      year: 2020 + Math.floor(Math.random() * 4),
      isVIP: index % 3 === 0,
      isNew: index < 3,
      genres: ['Action', 'Adventure', 'Fantasy'].slice(0, Math.floor(Math.random() * 3) + 1)
    }));
  };

  // Filter and search manga
  useEffect(() => {
    let result = mangas;

    // Search
    if (searchTerm) {
      result = result.filter(manga =>
        manga.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        manga.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      switch (selectedCategory) {
        case 'vip':
          result = result.filter(manga => manga.isVIP);
          break;
        case 'new':
          result = result.filter(manga => manga.isNew);
          break;
        default:
          result = result.filter(manga => 
            manga.genres.some(genre => 
              genre.toLowerCase().includes(selectedCategory)
            )
          );
      }
    }

    setFilteredMangas(result);
  }, [mangas, searchTerm, selectedCategory]);

  // Handle scroll for infinite loading
  const handleScroll = useCallback(() => {
    if (window.innerHeight + document.documentElement.scrollTop !== 
        document.documentElement.offsetHeight || 
        loading || !hasMore) {
      return;
    }
    setPage(prev => prev + 1);
  }, [loading, hasMore]);

  useEffect(() => {
    fetchManga(page);
  }, [page, fetchManga]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Add to favorites
  const handleAddFavorite = async (manga) => {
    if (!user) {
      alert('กรุณาเข้าสู่ระบบก่อน');
      return;
    }

    try {
      await api.post('/favorites/add', {
        userId: user._id,
        manga: {
          mangaId: manga.id,
          title: manga.title,
          image: manga.cover,
          score: manga.rating
        }
      });
      alert('เพิ่มในรายการโปรดแล้ว!');
    } catch (err) {
      console.error('Error adding favorite:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-900/50 to-purple-900/50 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                ค้นพบมังงะ
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                  ที่คุณรัก
                </span>
              </h1>
              <p className="text-gray-300 text-lg">
                อ่านมังงะใหม่ๆ มากกว่า 10,000 เรื่อง ฟรี!
              </p>
            </div>
            
            {user?.isAdmin && (
              <Link 
                to="/admin"
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all"
              >
                <Shield size={20} />
                เข้าสู่ Admin Panel
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
              <input
                type="text"
                placeholder="ค้นหามังงะ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-800/50 border border-gray-700 py-3 pl-12 pr-4 rounded-xl outline-none focus:border-blue-500 text-white placeholder-gray-500 backdrop-blur-sm"
              />
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-3 rounded-lg ${viewMode === 'grid' ? 'bg-blue-600' : 'bg-gray-800'}`}
            >
              <Grid size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-3 rounded-lg ${viewMode === 'list' ? 'bg-blue-600' : 'bg-gray-800'}`}
            >
              <List size={20} />
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="mb-8 overflow-x-auto">
          <div className="flex gap-2 pb-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600'
                    : 'bg-gray-800 hover:bg-gray-700'
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {loading && page === 1 && (
          <div className="flex justify-center py-12">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-900/30 border border-red-700 rounded-xl p-6 mb-6">
            <p className="text-red-300">{error}</p>
            <button
              onClick={() => fetchManga(1)}
              className="mt-4 px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700"
            >
              โหลดใหม่
            </button>
          </div>
        )}

        {/* Manga Grid/List */}
        {filteredMangas.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {filteredMangas.map(manga => (
                <MangaCard 
                  key={manga.id} 
                  manga={manga} 
                  onAddFavorite={handleAddFavorite}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMangas.map(manga => (
                <MangaListItem 
                  key={manga.id} 
                  manga={manga} 
                  onAddFavorite={handleAddFavorite}
                />
              ))}
            </div>
          )
        ) : (
          !loading && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">ไม่พบมังงะที่ค้นหา</p>
            </div>
          )
        )}

        {/* Loading More */}
        {loading && page > 1 && (
          <div className="flex justify-center py-8">
            <div className="flex items-center gap-3 text-gray-400">
              <div className="w-6 h-6 border-2 border-gray-600 border-t-blue-500 rounded-full animate-spin"></div>
              กำลังโหลดเพิ่ม...
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Manga Card Component
const MangaCard = ({ manga, onAddFavorite }) => (
  <Link to={`/manga/${manga.id}`} className="group">
    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-2">
      <ImageWithFallback
        src={manga.cover}
        alt={manga.title}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
      />
      
      {/* VIP Badge */}
      {manga.isVIP && (
        <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
          <span>👑</span> VIP
        </div>
      )}
      
      {/* New Badge */}
      {manga.isNew && (
        <div className="absolute top-3 right-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">
          NEW
        </div>
      )}
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="font-bold text-lg line-clamp-2 mb-2">{manga.title}</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-yellow-400">
              <Star size={14} fill="currentColor" />
              <span className="text-sm">{manga.rating.toFixed(1)}</span>
            </div>
            <span className="text-gray-300 text-sm">{manga.chapters} ตอน</span>
          </div>
        </div>
      </div>
    </div>
    
    <div className="mt-3">
      <h3 className="font-semibold line-clamp-1 group-hover:text-blue-400 transition-colors">
        {manga.title}
      </h3>
      <div className="flex items-center justify-between mt-1">
        <div className="flex items-center gap-1 text-sm text-gray-400">
          <TrendingUp size={12} />
          <span>{manga.year}</span>
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            onAddFavorite(manga);
          }}
          className="text-gray-400 hover:text-red-500 transition-colors"
        >
          <Heart size={16} />
        </button>
      </div>
    </div>
  </Link>
);

// Manga List Item Component
const MangaListItem = ({ manga, onAddFavorite }) => (
  <Link to={`/manga/${manga.id}`}>
    <div className="flex items-center gap-4 p-4 bg-gray-800/30 rounded-2xl hover:bg-gray-800/50 transition-all group">
      <div className="relative w-20 h-28 flex-shrink-0">
        <ImageWithFallback
          src={manga.cover}
          alt={manga.title}
          className="w-full h-full object-cover rounded-lg"
        />
        {manga.isVIP && (
          <div className="absolute -top-2 -left-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-xs font-bold px-2 py-0.5 rounded-full">
            VIP
          </div>
        )}
      </div>
      
      <div className="flex-1">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-bold text-lg group-hover:text-blue-400 transition-colors">
              {manga.title}
            </h3>
            <p className="text-gray-400 text-sm mt-1 line-clamp-2">
              {manga.description}
            </p>
          </div>
          
          <button
            onClick={(e) => {
              e.preventDefault();
              onAddFavorite(manga);
            }}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
          >
            <Heart size={18} />
          </button>
        </div>
        
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-1 text-yellow-400">
            <Star size={14} fill="currentColor" />
            <span className="text-sm">{manga.rating.toFixed(1)}</span>
          </div>
          
          <div className="flex items-center gap-1 text-gray-400">
            <Clock size={14} />
            <span className="text-sm">{manga.chapters} ตอน</span>
          </div>
          
          <div className="flex gap-1">
            {manga.genres.slice(0, 2).map((genre, idx) => (
              <span key={idx} className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">
                {genre}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  </Link>
);

export default MangaDisplay;