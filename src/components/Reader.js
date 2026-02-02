import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, ChevronRight, Lock } from 'lucide-react';

const Reader = ({ user }) => {
  const { mangaId, chapterId } = useParams();
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPages = async () => {
      setLoading(true);
      try {
        // ดึงตอนจริงจาก MangaDex (จำลอง Feed หน้า)
        const mockPages = [
          "https://uploads.mangadex.org/data/32d76d19-8a05-4d20-9fa4-699c3674dcf7/1-6e3e4a.png",
          "https://uploads.mangadex.org/data/32d76d19-8a05-4d20-9fa4-699c3674dcf7/2-9e2b1c.png"
        ];
        setPages(mockPages);
      } catch (e) { console.error(e); }
      setLoading(false);
      window.scrollTo(0, 0);
    };
    fetchPages();
  }, [chapterId]);

  // ระบบเช็คพรีเมียม: ถ้าอ่านเกินตอน 3 และไม่ใช่ VIP ให้ล็อก
  if (!user.isPremium && parseInt(chapterId) > 3) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black p-6">
        <div className="bg-gray-900 p-10 rounded-[3rem] border border-yellow-500/20 text-center max-w-sm">
          <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="text-yellow-500" size={40} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">บทนี้สำหรับ VIP เท่านั้น</h2>
          <p className="text-gray-500 text-sm mb-8">สมัครสมาชิกพรีเมียมเพื่ออ่านมังฮวาเรื่องนี้ให้จบ และสนับสนุนนักเขียน</p>
          <button className="w-full bg-yellow-500 text-black font-black py-4 rounded-2xl hover:scale-105 transition">UPGRADE TO VIP 👑</button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0a0a0a] min-h-screen">
      <div className="max-w-2xl mx-auto flex flex-col">
        {pages.map((p, i) => <img key={i} src={p} className="w-full h-auto" alt="" />)}
      </div>
      
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex gap-4 bg-gray-900/90 backdrop-blur-xl p-2 rounded-2xl border border-white/10 shadow-2xl">
        <Link to={`/reader/${mangaId}/${parseInt(chapterId) - 1}`} className="p-3 hover:bg-white/10 rounded-xl transition text-gray-400 hover:text-white"><ChevronLeft /></Link>
        <div className="px-6 flex items-center font-bold text-sm">Chapter {chapterId}</div>
        <Link to={`/reader/${mangaId}/${parseInt(chapterId) + 1}`} className="p-3 hover:bg-white/10 rounded-xl transition text-gray-400 hover:text-white"><ChevronRight /></Link>
      </div>
    </div>
  );
};
export default Reader;