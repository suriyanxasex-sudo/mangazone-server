import React, { useEffect, useState } from 'react';
import { api } from '../utils';
import { Users, BookPlus, Trash2, Crown, RefreshCw } from 'lucide-react';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // 1. ดึงรายชื่อผู้ใช้ทั้งหมด
  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/admin/users');
      setUsers(data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 2. ระบบจัดการ User (VIP / Delete)
  const handleUserAction = async (targetId, action) => {
    try {
      const { data } = await api.post('/admin/manage', { targetId, action });
      setUsers(data);
      setMessage(`Action ${action} successful!`);
    } catch (err) {
      setMessage("Failed to perform action");
    }
  };

  // 3. 🔥 ปุ่มลัดกู้ชีพ: เพิ่มมังงะตัวอย่าง 10 เรื่องรวดเดียว
  const seedMangaData = async () => {
    setLoading(true);
    const sampleManga = [
      { title: "Solo Leveling", genre: "Action", cover: "https://r4.wallpaperflare.com/wallpaper/702/100/381/anime-solo-leveling-sung-jin-woo-hd-wallpaper-49f038ad014a0dfbe637380f30c1467d.jpg", isVIP: true },
      { title: "One Piece", genre: "Adventure", cover: "https://images.alphacoders.com/134/1343715.png", isVIP: false },
      { title: "Naruto", genre: "Action", cover: "https://images6.alphacoders.com/134/1345480.png", isVIP: false },
      { title: "Demon Slayer", genre: "Fantasy", cover: "https://images8.alphacoders.com/100/1005869.jpg", isVIP: true },
      { title: "Jujutsu Kaisen", genre: "Supernatural", cover: "https://images7.alphacoders.com/109/1090288.jpg", isVIP: true },
      { title: "Black Clover", genre: "Magic", cover: "https://images2.alphacoders.com/886/886656.jpg", isVIP: false },
      { title: "My Hero Academia", genre: "Hero", cover: "https://images3.alphacoders.com/682/682006.jpg", isVIP: false },
      { title: "Attack on Titan", genre: "Mystery", cover: "https://images3.alphacoders.com/112/1128173.jpg", isVIP: true },
      { title: "Dragon Ball Super", genre: "Fighting", cover: "https://images2.alphacoders.com/710/710515.jpg", isVIP: false },
      { title: "Bleach: TYBW", genre: "Action", cover: "https://images8.alphacoders.com/125/1255871.jpg", isVIP: true }
    ];

    try {
      for (const manga of sampleManga) {
        await api.post('/admin/manga/add', manga);
      }
      setMessage("✅ เพิ่มมังงะตัวอย่าง 10 เรื่องเรียบร้อย! กลับไปดูที่หน้าแรกได้เลย");
    } catch (err) {
      setMessage("❌ เกิดข้อผิดพลาดในการเพิ่มข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto bg-black min-h-screen text-white">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-green-500 flex items-center gap-2">
          <Crown size={32} /> Admin Control Center
        </h1>
        <button 
          onClick={seedMangaData}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition"
        >
          <BookPlus size={20} /> {loading ? "กำลังเพิ่ม..." : "เพิ่มมังงะตัวอย่าง x10"}
        </button>
      </div>

      {message && (
        <div className="bg-gray-800 border-l-4 border-green-500 p-4 mb-6 rounded shadow-lg">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ส่วนจัดการ User */}
        <div className="lg:col-span-2 bg-gray-900 rounded-xl p-6 border border-gray-800 shadow-xl">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-300">
            <Users size={20} /> สมาชิกทั้งหมด ({users.length})
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-gray-500 border-b border-gray-800">
                <tr>
                  <th className="pb-3">ชื่อผู้ใช้</th>
                  <th className="pb-3 text-center">สถานะ VIP</th>
                  <th className="pb-3 text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {users.map(u => (
                  <tr key={u._id} className="hover:bg-gray-800/30 transition">
                    <td className="py-4 font-medium">
                      {u.username} {u.isAdmin && <span className="text-green-500 text-xs ml-1">👑 Admin</span>}
                    </td>
                    <td className="py-4 text-center">
                      {u.isPremium ? (
                        <span className="text-yellow-400 font-bold bg-yellow-400/10 px-2 py-1 rounded text-xs">VIP ACTIVE</span>
                      ) : (
                        <span className="text-gray-600 text-xs">FREE</span>
                      )}
                    </td>
                    <td className="py-4 text-right flex justify-end gap-2">
                      <button 
                        onClick={() => handleUserAction(u._id, 'toggle_vip')}
                        className="p-2 bg-yellow-600/20 text-yellow-500 rounded hover:bg-yellow-600 hover:text-white transition"
                        title="ให้/ยกเลิก VIP"
                      >
                        <RefreshCw size={16} />
                      </button>
                      {!u.isAdmin && (
                        <button 
                          onClick={() => handleUserAction(u._id, 'delete')}
                          className="p-2 bg-red-600/20 text-red-500 rounded hover:bg-red-600 hover:text-white transition"
                          title="ลบผู้ใช้"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ส่วนสรุปสถิติ */}
        <div className="space-y-6">
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h3 className="text-gray-400 text-sm mb-1 font-bold">ยอดผู้ใช้งาน</h3>
            <p className="text-4xl font-bold text-white">{users.length}</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 border-l-4 border-yellow-500">
            <h3 className="text-gray-400 text-sm mb-1 font-bold">สมาชิก VIP</h3>
            <p className="text-4xl font-bold text-yellow-500">
              {users.filter(u => u.isPremium).length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;