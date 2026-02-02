import React from 'react';
import { useParams, Link } from 'react-router-dom';

const Reader = ({ user }) => {
  const { mangaId, chapterId } = useParams();

  // จำลองหน้ากระดาษ (ของจริงต้องดึงจาก API ถ้ามีรูป)
  const pages = [1, 2, 3, 4, 5]; 

  if (!user.isPremium && parseInt(chapterId) > 3) {
      return (
          <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
              <h2 className="text-2xl font-bold text-yellow-500 mb-4">VIP Content 👑</h2>
              <p className="text-gray-400 mb-6">Chapter นี้สำหรับสมาชิก VIP เท่านั้น</p>
              <Link to="/" className="text-green-400 hover:underline">กลับหน้าหลัก</Link>
          </div>
      )
  }

  return (
    <div className="max-w-4xl mx-auto bg-gray-900 min-h-screen pb-10">
      <div className="p-4 bg-gray-800 flex justify-between items-center sticky top-0">
         <Link to="/" className="text-gray-400 hover:text-white">← Back</Link>
         <h2 className="text-white font-bold">Chapter {chapterId}</h2>
      </div>
      
      <div className="flex flex-col gap-2 p-2">
        {pages.map(page => (
            <div key={page} className="w-full aspect-[2/3] bg-gray-800 flex items-center justify-center text-gray-500">
                {/* ใส่รูปจริงตรงนี้ */}
                Page {page} (Demo)
            </div>
        ))}
      </div>
    </div>
  );
};

export default Reader;