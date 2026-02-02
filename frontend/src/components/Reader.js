import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ChevronLeft, 
  ChevronRight, 
  Home, 
  List, 
  Settings, 
  Download, 
  Sun, 
  Moon,
  Maximize2,
  Minimize2,
  BookOpen,
  Lock,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import { api } from '../utils';

const Reader = () => {
  const { mangaId, chapterId, chapterNum } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [pages, setPages] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mangaInfo, setMangaInfo] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showChapters, setShowChapters] = useState(false);
  const [readerMode, setReaderMode] = useState('vertical'); // 'vertical' or 'horizontal'
  const [theme, setTheme] = useState('dark'); // 'dark' or 'light'
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoScroll, setAutoScroll] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(50);
  
  const readerRef = useRef(null);
  const autoScrollRef = useRef(null);

  // Check VIP access
  const isVIPRequired = parseInt(chapterNum) > 3;
  const hasAccess = !isVIPRequired || (user?.isPremium);

  // Fetch pages and manga info
  useEffect(() => {
    const fetchData = async () => {
      if (!hasAccess) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Fetch pages from MangaDex
        const { data } = await axios.get(`https://api.mangadex.org/at-home/server/${chapterId}`);
        const { hash, data: files } = data.chapter;
        
        const pageUrls = files.map(file => 
          `https://uploads.mangadex.org/data/${hash}/${file}`
        );
        
        setPages(pageUrls);

        // Fetch manga info
        const mangaRes = await axios.get(`https://api.mangadex.org/manga/${mangaId}`);
        const mangaData = mangaRes.data.data;
        setMangaInfo({
          title: mangaData.attributes.title.en || Object.values(mangaData.attributes.title)[0],
          cover: `https://uploads.mangadex.org/covers/${mangaId}/${mangaData.relationships.find(r => r.type === 'cover_art')?.attributes?.fileName}.256.jpg`
        });

        // Fetch chapters list
        const chaptersRes = await axios.get(`https://api.mangadex.org/manga/${mangaId}/feed`, {
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
          isVIP: parseInt(chapter.attributes.chapter) > 3
        }));

        setChapters(chaptersData);
        setError('');

        // Save to history
        if (user && mangaInfo) {
          await api.post('/history/add', {
            userId: user._id,
            manga: {
              mangaId,
              title: mangaInfo.title,
              image: mangaInfo.cover
            },
            chapter: {
              id: chapterId,
              ch: parseInt(chapterNum)
            }
          });
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('ไม่สามารถโหลดข้อมูลได้');
        
        // Fallback data for testing
        setPages([
          'https://picsum.photos/800/1200?random=1',
          'https://picsum.photos/800/1200?random=2',
          'https://picsum.photos/800/1200?random=3'
        ]);
        
        setMangaInfo({
          title: 'มังงะตัวอย่าง',
          cover: 'https://picsum.photos/400/600'
        });
      } finally {
        setLoading(false);
        window.scrollTo(0, 0);
      }
    };

    fetchData();
  }, [mangaId, chapterId, chapterNum, user, hasAccess]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch(e.key) {
        case 'ArrowLeft':
          handlePrevPage();
          break;
        case 'ArrowRight':
          handleNextPage();
          break;
        case 'Escape':
          if (isFullscreen) {
            document.exitFullscreen();
            setIsFullscreen(false);
          }
          break;
        case ' ':
          e.preventDefault();
          setAutoScroll(prev => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, pages.length, isFullscreen]);

  // Auto scroll effect
  useEffect(() => {
    if (!autoScroll || !readerRef.current) return;

    const scrollInterval = setInterval(() => {
      window.scrollBy(0, 1);
      
      // Check if reached bottom
      if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 100) {
        handleNextPage();
      }
    }, 100 - scrollSpeed);

    return () => clearInterval(scrollInterval);
  }, [autoScroll, scrollSpeed]);

  // Handle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Navigation functions
  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
      window.scrollTo(0, 0);
    } else if (currentChapterIndex > 0) {
      // Go to previous chapter
      const prevChapter = chapters[currentChapterIndex - 1];
      navigate(`/reader/${mangaId}/${prevChapter.id}/${prevChapter.chapter}`);
    }
  };

  const handleNextPage = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(prev => prev + 1);
      window.scrollTo(0, 0);
    } else if (currentChapterIndex < chapters.length - 1) {
      // Go to next chapter
      const nextChapter = chapters[currentChapterIndex + 1];
      navigate(`/reader/${mangaId}/${nextChapter.id}/${nextChapter.chapter}`);
    }
  };

  const handleChapterSelect = (chapter) => {
    if (chapter.isVIP && !user?.isPremium) {
      alert('บทนี้สำหรับสมาชิก VIP เท่านั้น');
      return;
    }
    navigate(`/reader/${mangaId}/${chapter.id}/${chapter.chapter}`);
    setShowChapters(false);
    setCurrentPage(0);
  };

  // Current chapter index
  const currentChapterIndex = chapters.findIndex(ch => ch.chapter === parseInt(chapterNum));

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="mb-8">
            <Lock className="text-yellow-400 mx-auto mb-6" size={64} />
            <h2 className="text-3xl font-bold text-white mb-4">VIP ONLY</h2>
            <p className="text-gray-400 text-lg mb-2">
              ตอนที่ {chapterNum} สำหรับสมาชิก VIP เท่านั้น
            </p>
            <p className="text-gray-500">
              สมัครสมาชิก VIP เพื่ออ่านตอนนี้และทุกตอนพิเศษ
            </p>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={() => navigate('/premium')}
              className="w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold rounded-xl text-lg hover:shadow-lg hover:scale-105 transition-all"
            >
              สมัคร VIP เริ่มต้นเพียง 99 บาท/เดือน
            </button>
            
            <button
              onClick={() => navigate(`/manga/${mangaId}`)}
              className="w-full py-4 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition-colors"
            >
              กลับไปหน้ามังงะ
            </button>
          </div>
          
          <div className="mt-8 p-4 bg-gray-800/30 rounded-xl">
            <h3 className="font-bold mb-2">สิทธิพิเศษสำหรับสมาชิก VIP</h3>
            <ul className="text-gray-400 text-sm space-y-1">
              <li>✓ อ่านทุกเรื่องได้ไม่จำกัด</li>
              <li>✓ ไม่มีโฆษณารบกวน</li>
              <li>✓ อ่านตอนใหม่ก่อนใคร 24 ชั่วโมง</li>
              <li>✓ ดาวน์โหลดอ่านแบบออฟไลน์ได้</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">กำลังโหลดมังงะ...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            กลับ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={readerRef}
      className={`min-h-screen ${theme === 'dark' ? 'bg-black' : 'bg-gray-100'}`}
    >
      {/* Header */}
      <div className={`sticky top-0 z-50 ${
        theme === 'dark' 
          ? 'bg-gray-900/90 backdrop-blur-md border-b border-gray-800' 
          : 'bg-white/90 backdrop-blur-md border-b border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(`/manga/${mangaId}`)}
                className="flex items-center gap-2 hover:opacity-80"
              >
                <ArrowLeft size={20} />
                <span>กลับ</span>
              </button>
              
              <div className="hidden md:block">
                <h1 className="font-bold truncate max-w-md">
                  {mangaInfo?.title} - ตอนที่ {chapterNum}
                </h1>
                <p className="text-sm opacity-70">
                  หน้าที่ {currentPage + 1} จาก {pages.length}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowChapters(true)}
                className="p-2 rounded-lg hover:bg-gray-800"
                title="รายการตอน"
              >
                <List size={20} />
              </button>
              
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 rounded-lg hover:bg-gray-800"
                title="ตั้งค่า"
              >
                <Settings size={20} />
              </button>
              
              <button
                onClick={toggleFullscreen}
                className="p-2 rounded-lg hover:bg-gray-800"
                title={isFullscreen ? 'ย่อ' : 'ขยายเต็มหน้าจอ'}
              >
                {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
              </button>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mt-2">
            <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all"
                style={{ width: `${((currentPage + 1) / pages.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className={`fixed right-4 top-20 z-40 w-64 p-4 rounded-xl shadow-2xl ${
          theme === 'dark' 
            ? 'bg-gray-900 border border-gray-800' 
            : 'bg-white border border-gray-200'
        }`}>
          <h3 className="font-bold mb-4">ตั้งค่าการอ่าน</h3>
          
          <div className="space-y-4">
            {/* Theme */}
            <div>
              <label className="block text-sm mb-2">ธีม</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setTheme('dark')}
                  className={`flex-1 py-2 rounded-lg ${
                    theme === 'dark' 
                      ? 'bg-blue-600' 
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  <Moon className="mx-auto" size={20} />
                </button>
                <button
                  onClick={() => setTheme('light')}
                  className={`flex-1 py-2 rounded-lg ${
                    theme === 'light' 
                      ? 'bg-blue-600' 
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  <Sun className="mx-auto" size={20} />
                </button>
              </div>
            </div>
            
            {/* Reader Mode */}
            <div>
              <label className="block text-sm mb-2">โหมดการอ่าน</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setReaderMode('vertical')}
                  className={`flex-1 py-2 rounded-lg ${
                    readerMode === 'vertical' 
                      ? 'bg-blue-600' 
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  แนวตั้ง
                </button>
                <button
                  onClick={() => setReaderMode('horizontal')}
                  className={`flex-1 py-2 rounded-lg ${
                    readerMode === 'horizontal' 
                      ? 'bg-blue-600' 
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  แนวนอน
                </button>
              </div>
            </div>
            
            {/* Auto Scroll */}
            <div>
              <label className="flex items-center justify-between mb-2">
                <span className="text-sm">เลื่อนอัตโนมัติ</span>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={autoScroll}
                    onChange={(e) => setAutoScroll(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-10 h-6 rounded-full transition-all ${
                    autoScroll ? 'bg-blue-600' : 'bg-gray-700'
                  }`}>
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                      autoScroll ? 'left-5' : 'left-1'
                    }`} />
                  </div>
                </div>
              </label>
              
              {autoScroll && (
                <div className="mt-2">
                  <label className="text-xs block mb-1">ความเร็ว</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={scrollSpeed}
                    onChange={(e) => setScrollSpeed(e.target.value)}
                    className="w-full"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Chapters Panel */}
      {showChapters && (
        <div className="fixed inset-0 z-50 bg-black/80 flex">
          <div 
            className="w-full max-w-md bg-gray-900 h-full overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-800 flex justify-between items-center">
              <h3 className="text-xl font-bold">รายการตอน</h3>
              <button
                onClick={() => setShowChapters(false)}
                className="p-2 hover:bg-gray-800 rounded-lg"
              >
                ✕
              </button>
            </div>
            
            <div className="p-4">
              <div className="mb-6">
                {mangaInfo && (
                  <div className="flex gap-4">
                    <img
                      src={mangaInfo.cover}
                      alt={mangaInfo.title}
                      className="w-20 h-28 object-cover rounded-lg"
                    />
                    <div>
                      <h4 className="font-bold">{mangaInfo.title}</h4>
                      <p className="text-gray-400 text-sm mt-1">
                        {chapters.length} ตอน
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-1">
                {chapters.map(chapter => (
                  <button
                    key={chapter.id}
                    onClick={() => handleChapterSelect(chapter)}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      parseInt(chapterNum) === chapter.chapter
                        ? 'bg-blue-600'
                        : chapter.isVIP && !user?.isPremium
                        ? 'bg-gray-800/50 opacity-70'
                        : 'hover:bg-gray-800'
                    }`}
                    disabled={chapter.isVIP && !user?.isPremium}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold">ตอนที่ {chapter.chapter}</div>
                        <div className="text-sm text-gray-400 truncate">
                          {chapter.title}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {chapter.isVIP && (
                          <Crown size={16} className="text-yellow-400" />
                        )}
                        {parseInt(chapterNum) === chapter.chapter && (
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reader Content */}
      <div className="max-w-4xl mx-auto py-8 px-4">
        {readerMode === 'vertical' ? (
          // Vertical Mode
          <div className="space-y-4">
            {pages.map((url, index) => (
              <div
                key={index}
                className={`${index === currentPage ? 'ring-2 ring-blue-500' : ''}`}
              >
                <img
                  src={url}
                  alt={`Page ${index + 1}`}
                  className="w-full h-auto rounded-lg shadow-2xl mx-auto"
                  loading="lazy"
                  onLoad={() => {
                    if (index === currentPage) {
                      window.scrollTo(0, 0);
                    }
                  }}
                />
                {index === currentPage && (
                  <div className="text-center mt-2 text-gray-500">
                    หน้าที่ {index + 1} จาก {pages.length}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          // Horizontal Mode
          <div className="flex overflow-x-auto snap-x snap-mandatory h-screen">
            {pages.map((url, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-full snap-center"
              >
                <img
                  src={url}
                  alt={`Page ${index + 1}`}
                  className="w-full h-auto max-h-[90vh] object-contain mx-auto"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Navigation Overlay */}
      <div className="fixed inset-0 pointer-events-none z-30">
        <div className="absolute left-0 top-0 bottom-0 w-1/4 pointer-events-auto"
             onClick={handlePrevPage} />
        <div className="absolute right-0 top-0 bottom-0 w-1/4 pointer-events-auto"
             onClick={handleNextPage} />
      </div>

      {/* Bottom Navigation */}
      <div className={`fixed bottom-0 left-0 right-0 ${
        theme === 'dark' 
          ? 'bg-gray-900/90 backdrop-blur-md border-t border-gray-800' 
          : 'bg-white/90 backdrop-blur-md border-t border-gray-200'
      }`}>
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 0 && currentChapterIndex === 0}
              className="px-6 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <ChevronLeft size={20} />
              {currentPage === 0 ? 'ตอนก่อนหน้า' : 'หน้าที่แล้ว'}
            </button>
            
            <div className="text-center hidden md:block">
              <div className="text-sm opacity-70">
                {mangaInfo?.title}
              </div>
              <div className="font-bold">
                ตอนที่ {chapterNum} • หน้าที่ {currentPage + 1} จาก {pages.length}
              </div>
            </div>
            
            <button
              onClick={handleNextPage}
              disabled={currentPage === pages.length - 1 && currentChapterIndex === chapters.length - 1}
              className="px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {currentPage === pages.length - 1 ? 'ตอนถัดไป' : 'หน้าถัดไป'}
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Help Text */}
      <div className="fixed bottom-20 right-4 z-30">
        <div className={`p-3 rounded-lg text-sm ${
          theme === 'dark' ? 'bg-gray-800/80' : 'bg-white/80'
        }`}>
          <div>← → เพื่อเปลี่ยนหน้า</div>
          <div>Space เพื่อเลื่อนอัตโนมัติ</div>
          <div>ESC เพื่อออกจากเต็มหน้าจอ</div>
        </div>
      </div>
    </div>
  );
};

export default Reader;