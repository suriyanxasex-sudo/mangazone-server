import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, 
  BookOpen, 
  Heart, 
  Share2, 
  Download, 
  Star, 
  Clock, 
  Users,
  Calendar,
  Tag,
  ChevronRight,
  Lock,
  MessageSquare,
  Bookmark
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import { api, ImageWithFallback, timeAgo } from '../utils';

const MangaDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [manga, setManga] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState('chapters'); // 'chapters' or 'comments'

  // Fetch manga details
  useEffect(() => {
    const fetchMangaDetails = async () => {
      setLoading(true);
      try {
        // Fetch from MangaDex API
        const { data } = await axios.get(`https://api.mangadex.org/manga/${id}`, {
          params: {
            includes: ['cover_art', 'author', 'artist']
          }
        });

        const mangaData = data.data;
        const attributes = mangaData.attributes;
        const coverArt = mangaData.relationships.find(r => r.type === 'cover_art');
        const author = mangaData.relationships.find(r => r.type === 'author');
        const artist = mangaData.relationships.find(r => r.type === 'artist');

        setManga({
          id: mangaData.id,
          title: attributes.title.en || Object.values(attributes.title)[0],
          description: attributes.description?.en || attributes.description?.th || 'ไม่มีคำอธิบาย',
          cover: coverArt ? 
                `https://uploads.mangadex.org/covers/${mangaData.id}/${coverArt.attributes.fileName}.512.jpg` : 
                null,
          author: author?.attributes?.name || 'ไม่ทราบผู้แต่ง',
          artist: artist?.attributes?.name || 'ไม่ทราบผู้วาด',
          status: attributes.status === 'ongoing' ? 'กำลังอัปเดต' : 'จบแล้ว',
          year: attributes.year || 2023,
          rating: 4.5 + (Math.random() * 0.5),
          views: Math.floor(Math.random() * 1000000),
          followers: Math.floor(Math.random() * 100000),
          genres: attributes.tags?.slice(0, 5).map(tag => ({
            id: tag.id,
            name: tag.attributes.name.en
          })) || [],
          isVIP: Math.random() > 0.6
        });

        // Fetch chapters
        const chaptersRes = await axios.get(`https://api.mangadex.org/manga/${id}/feed`, {
          params: {
            limit: 50,
            translatedLanguage: ['th', 'en'],
            order: { chapter: 'desc' }
          }
        });

        const chaptersData = chaptersRes.data.data.map(chapter => ({
          id: chapter.id,
          chapter: chapter.attributes.chapter,
          title: chapter.attributes.title || `ตอนที่ ${chapter.attributes.chapter}`,
          date: chapter.attributes.updatedAt,
          pages: chapter.attributes.pages || 20,
          isVIP: Math.random() > 0.7
        }));

        setChapters(chaptersData);

        // Fetch comments
        const commentsRes = await api.get(`/comments/${id}`);
        setComments(commentsRes.data);

        // Check if favorite
        if (user) {
          const userRes = await api.get(`/user/${user.username}`);
          const isFav = userRes.data.favorites?.some(fav => fav.mangaId === id);
          setIsFavorite(isFav);
        }

        setError('');
      } catch (err) {
        console.error('Error fetching manga:', err);
        setError('ไม่สามารถโหลดข้อมูลมังงะได้');
        // Set fallback data
        setFallbackData();
      } finally {
        setLoading(false);
      }
    };

    fetchMangaDetails();
  }, [id, user]);

  // Set fallback data
  const setFallbackData = () => {
    setManga({
      id,
      title: 'Solo Leveling',
      description: 'ในโลกที่ฮันเตอร์ผู้มีความสามารถพิเศษต้องต่อสู้กับมอนสเตอร์จากประตูมิติ ซ็องจินวู ฮันเตอร์ระดับอีที่อ่อนแอที่สุด กลับได้รับพลังสุดล้ำหลังจากติดอยู่ในดันเจี้ยนอันตรายถึงตาย',
      cover: 'https://images.alphacoders.com/134/1343715.png',
      author: 'Chugong',
      artist: 'Dubu (Redice Studio)',
      status: 'จบแล้ว',
      year: 2018,
      rating: 4.8,
      views: 2500000,
      followers: 1500000,
      genres: [
        { id: 1, name: 'Action' },
        { id: 2, name: 'Fantasy' },
        { id: 3, name: 'Adventure' }
      ],
      isVIP: true
    });

    setChapters([
      { id: '1', chapter: 179, title: 'ตอนสุดท้าย', date: '2023-12-31', pages: 45, isVIP: false },
      { id: '2', chapter: 178, title: 'การต่อสู้ครั้งสุดท้าย', date: '2023-12-24', pages: 38, isVIP: true },
      { id: '3', chapter: 177, title: 'การเผชิญหน้า', date: '2023-12-17', pages: 42, isVIP: true },
      { id: '4', chapter: 176, title: 'ความจริงที่เปิดเผย', date: '2023-12-10', pages: 36, isVIP: false },
    ]);
  };

  // Handle add/remove favorite
  const handleFavorite = async () => {
    if (!user) {
      alert('กรุณาเข้าสู่ระบบก่อน');
      return;
    }

    try {
      if (isFavorite) {
        await api.post('/favorites/remove', {
          userId: user._id,
          mangaId: id
        });
        setIsFavorite(false);
      } else {
        await api.post('/favorites/add', {
          userId: user._id,
          manga: {
            mangaId: id,
            title: manga.title,
            image: manga.cover,
            score: manga.rating
          }
        });
        setIsFavorite(true);
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  // Handle add comment
  const handleAddComment = async () => {
    if (!user) {
      alert('กรุณาเข้าสู่ระบบก่อน');
      return;
    }

    if (!newComment.trim()) {
      alert('กรุณากรอกความคิดเห็น');
      return;
    }

    try {
      const { data } = await api.post('/comments', {
        mangaId: id,
        username: user.username,
        message: newComment,
        avatar: user.avatar
      });

      setComments([data, ...comments]);
      setNewComment('');
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  // Handle read chapter
  const handleReadChapter = (chapter) => {
    if (chapter.isVIP && !user?.isPremium) {
      alert('บทนี้สำหรับสมาชิก VIP เท่านั้น');
      return;
    }
    navigate(`/reader/${id}/${chapter.id}/${chapter.chapter}`);
  };

  // Handle share
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: manga.title,
          text: manga.description,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('คัดลอกลิงก์แล้ว!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">กำลังโหลดข้อมูลมังงะ...</p>
        </div>
      </div>
    );
  }

  if (error || !manga) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-4">{error || 'ไม่พบมังงะนี้'}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            กลับหน้าหลัก
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Back Button */}
      <div className="sticky top-0 z-40 bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-300 hover:text-white"
          >
            <ArrowLeft size={20} />
            กลับ
          </button>
        </div>
      </div>

      {/* Manga Header */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cover Image */}
          <div className="lg:w-1/3">
            <div className="relative">
              <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl">
                <ImageWithFallback
                  src={manga.cover}
                  alt={manga.title}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* VIP Badge */}
              {manga.isVIP && (
                <div className="absolute top-4 left-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold px-4 py-2 rounded-full">
                  👑 VIP ONLY
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="absolute bottom-4 right-4 flex gap-2">
                <button
                  onClick={handleFavorite}
                  className={`p-3 rounded-full ${
                    isFavorite 
                      ? 'bg-red-600 text-white' 
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
                </button>
                <button
                  onClick={handleShare}
                  className="p-3 rounded-full bg-gray-800 text-gray-300 hover:bg-gray-700"
                >
                  <Share2 size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Manga Info */}
          <div className="lg:w-2/3">
            <div className="mb-6">
              <h1 className="text-4xl font-bold mb-2">{manga.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-gray-400">
                <span>โดย {manga.author}</span>
                <span>•</span>
                <span>{manga.artist}</span>
                <span>•</span>
                <span>{manga.year}</span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gray-800/50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-yellow-400">
                  <Star size={20} fill="currentColor" />
                  <span className="text-2xl font-bold">{manga.rating.toFixed(1)}</span>
                </div>
                <p className="text-gray-400 text-sm mt-1">คะแนน</p>
              </div>
              
              <div className="bg-gray-800/50 rounded-xl p-4">
                <div className="flex items-center gap-2">
                  <BookOpen size={20} className="text-blue-400" />
                  <span className="text-2xl font-bold">{chapters.length}</span>
                </div>
                <p className="text-gray-400 text-sm mt-1">ตอน</p>
              </div>
              
              <div className="bg-gray-800/50 rounded-xl p-4">
                <div className="flex items-center gap-2">
                  <Users size={20} className="text-green-400" />
                  <span className="text-2xl font-bold">
                    {(manga.followers / 1000).toFixed(1)}K
                  </span>
                </div>
                <p className="text-gray-400 text-sm mt-1">ผู้ติดตาม</p>
              </div>
              
              <div className="bg-gray-800/50 rounded-xl p-4">
                <div className="flex items-center gap-2">
                  <Calendar size={20} className="text-purple-400" />
                  <span className="text-2xl font-bold">{manga.status}</span>
                </div>
                <p className="text-gray-400 text-sm mt-1">สถานะ</p>
              </div>
            </div>

            {/* Genres */}
            <div className="mb-8">
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <Tag size={20} />
                ประเภท
              </h3>
              <div className="flex flex-wrap gap-2">
                {manga.genres.map(genre => (
                  <span
                    key={genre.id}
                    className="px-4 py-2 bg-gray-800 rounded-full hover:bg-gray-700 cursor-pointer"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h3 className="text-lg font-bold mb-3">เรื่องย่อ</h3>
              <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                {manga.description}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4">
              {chapters.length > 0 && (
                <button
                  onClick={() => handleReadChapter(chapters[0])}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all"
                >
                  อ่านตอนล่าสุด
                </button>
              )}
              
              <button
                onClick={() => setActiveTab('chapters')}
                className="px-8 py-3 bg-gray-800 rounded-xl font-bold hover:bg-gray-700 transition-all"
              >
                ดูทั้งหมด {chapters.length} ตอน
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-12">
          <div className="flex border-b border-gray-800">
            <button
              onClick={() => setActiveTab('chapters')}
              className={`px-6 py-3 font-bold ${activeTab === 'chapters' ? 'border-b-2 border-blue-500' : 'text-gray-400'}`}
            >
              <BookOpen className="inline mr-2" size={20} />
              บททั้งหมด ({chapters.length})
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`px-6 py-3 font-bold ${activeTab === 'comments' ? 'border-b-2 border-blue-500' : 'text-gray-400'}`}
            >
              <MessageSquare className="inline mr-2" size={20} />
              ความคิดเห็น ({comments.length})
            </button>
          </div>

          {/* Chapters Tab */}
          {activeTab === 'chapters' && (
            <div className="mt-6">
              <div className="grid gap-2">
                {chapters.map(chapter => (
                  <div
                    key={chapter.id}
                    className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl hover:bg-gray-800/50 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center">
                        <span className="font-bold">{chapter.chapter}</span>
                      </div>
                      <div>
                        <h4 className="font-bold">{chapter.title}</h4>
                        <div className="flex items-center gap-3 text-sm text-gray-400 mt-1">
                          <span>{timeAgo(chapter.date)}</span>
                          <span>•</span>
                          <span>{chapter.pages} หน้า</span>
                          {chapter.isVIP && (
                            <>
                              <span>•</span>
                              <span className="text-yellow-400">VIP</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {chapter.isVIP && !user?.isPremium && (
                        <Lock className="text-yellow-400" size={20} />
                      )}
                      <button
                        onClick={() => handleReadChapter(chapter)}
                        className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                      >
                        อ่าน
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Comments Tab */}
          {activeTab === 'comments' && (
            <div className="mt-6">
              {/* Add Comment */}
              {user ? (
                <div className="mb-6 p-4 bg-gray-800/30 rounded-xl">
                  <div className="flex gap-3">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.username}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="แสดงความคิดเห็นของคุณ..."
                        className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 min-h-[100px] outline-none focus:border-blue-500"
                      />
                      <div className="flex justify-end mt-3">
                        <button
                          onClick={handleAddComment}
                          className="px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-700"
                        >
                          ส่งความคิดเห็น
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-6 p-4 bg-gray-800/30 rounded-xl text-center">
                  <p className="text-gray-400">
                    <button
                      onClick={() => navigate('/login')}
                      className="text-blue-400 hover:underline"
                    >
                      เข้าสู่ระบบ
                    </button>
                    {' '}เพื่อแสดงความคิดเห็น
                  </p>
                </div>
              )}

              {/* Comments List */}
              <div className="space-y-4">
                {comments.length > 0 ? (
                  comments.map(comment => (
                    <div key={comment._id} className="p-4 bg-gray-800/30 rounded-xl">
                      <div className="flex gap-3">
                        {comment.avatar ? (
                          <img
                            src={comment.avatar}
                            alt={comment.username}
                            className="w-10 h-10 rounded-full"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold">
                            {comment.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="font-bold">{comment.username}</span>
                              <span className="text-gray-400 text-sm ml-2">
                                {timeAgo(comment.createdAt)}
                              </span>
                            </div>
                          </div>
                          <p className="mt-2 text-gray-300">{comment.message}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    ยังไม่มีความคิดเห็น
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MangaDetail;