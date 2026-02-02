import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Lock, ChevronLeft } from 'lucide-react';
import { useAuth } from '../AuthContext';

const Reader = () => {
  const { mangaId, chapterId, chapterNum } = useParams();
  const { user } = useAuth();
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPages = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`https://api.mangadex.org/at-home/server/${chapterId}`);
        const { hash, data: files } = data.chapter;
        setPages(files.map(f => `https://uploads.mangadex.org/data/${hash}/${f}`));
      } catch (e) { console.error(e); }
      setLoading(false);
      window.scrollTo(0, 0);
    };
    fetchPages();
  }, [chapterId]);

  if (!user?.isPremium && parseInt(chapterNum) > 3) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="bg-gray-900 p-12 rounded-[3rem] border border-yellow-500/20 text-center max-w-sm shadow-2xl">
          <Lock className="text-yellow-500 mx-auto mb-6" size={60} />
          <h2 className="text-2xl font-black text-white mb-4">VIP ONLY</h2>
          <p className="text-gray-500 text-sm mb-8">ตอนที่ {chapterNum} สำหรับสมาชิก VIP เท่านั้น</p>
          <button className="w-full bg-yellow-500 text-black font-black py-4 rounded-2xl shadow-lg">UPGRADE NOW 👑</button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen flex flex-col items-center">
      <div className="max-w-3xl w-full">
        {loading ? <div className="py-40 text-center text-green-500 font-black animate-pulse">LOADING PAGES...</div> :
          pages.map((url, i) => <img key={i} src={url} className="w-full h-auto block" alt="" loading="lazy" />)}
      </div>
    </div>
  );
};
export default Reader;