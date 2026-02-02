import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils';

const MangaDisplay = ({ user }) => {
  const [mangaList, setMangaList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchManga = async () => {
      try {
        const { data } = await api.get('/manga'); // ดึงข้อมูลจาก Render
        setMangaList(data);
      } catch (err) {
        console.error("Error fetching manga:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchManga();
  }, []);

  if (loading) return <div className="p-10 text-center text-gray-400">Loading Manga...</div>;

  return (
    <div className="p-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
      {mangaList.map((manga) => (
        <Link to={`/reader/${manga._id}/1`} key={manga._id} className="group relative block bg-gray-900 rounded-lg overflow-hidden hover:scale-105 transition duration-300">
          <div className="aspect-[2/3] w-full overflow-hidden">
             {/* ใช้รูป placeholder ถ้าไม่มีรูปจริง */}
            <img src={manga.cover || "https://via.placeholder.com/300x450?text=No+Cover"} alt={manga.title} className="w-full h-full object-cover group-hover:opacity-80 transition" />
          </div>
          {manga.isVIP && (
            <div className="absolute top-2 right-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded shadow-lg">
              VIP 👑
            </div>
          )}
          <div className="p-3">
            <h3 className="font-bold text-white truncate">{manga.title}</h3>
            <p className="text-xs text-gray-400">{manga.genre}</p>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default MangaDisplay;