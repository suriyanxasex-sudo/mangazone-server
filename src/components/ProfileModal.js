import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { api } from '../utils';
import { 
  User, 
  Camera, 
  Save, 
  X, 
  Mail, 
  Calendar, 
  Crown,
  BookOpen,
  History,
  Star,
  Shield
} from 'lucide-react';

const ProfileModal = ({ onClose }) => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'favorites', 'history'
  
  const [formData, setFormData] = useState({
    username: user?.username || '',
    avatar: user?.avatar || '',
    email: '',
    bio: ''
  });
  
  const [favorites, setFavorites] = useState([]);
  const [history, setHistory] = useState([]);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return;

      try {
        // Load favorites and history
        const { data } = await api.get(`/user/${user.username}`);
        setFavorites(data.favorites || []);
        setHistory(data.history || []);
        
        setFormData(prev => ({
          ...prev,
          email: data.email || '',
          bio: data.bio || ''
        }));
      } catch (err) {
        console.error('Error loading user data:', err);
      }
    };

    loadUserData();
  }, [user]);

  // Handle form changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    setSuccess('');
  };

  // Handle avatar upload
  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('ไฟล์รูปภาพต้องมีขนาดไม่เกิน 5MB');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      setError('กรุณาอัพโหลดไฟล์รูปภาพเท่านั้น');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      setAvatarPreview(base64String);
      setFormData(prev => ({ ...prev, avatar: base64String }));
    };
    reader.readAsDataURL(file);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setError('กรุณาเข้าสู่ระบบก่อน');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { data } = await api.put('/user/update', {
        userId: user._id,
        newUsername: formData.username !== user.username ? formData.username : undefined,
        newAvatar: formData.avatar !== user.avatar ? formData.avatar : undefined
      });

      // Update user in context
      updateUser({
        username: data.username,
        avatar: data.avatar
      });

      setSuccess('อัปเดตโปรไฟล์สำเร็จ!');
      
      // Refresh page after success
      setTimeout(() => {
        window.location.reload();
      }, 1500);

    } catch (err) {
      const errorMsg = err.response?.data?.error || 'ไม่สามารถอัปเดตโปรไฟล์ได้';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Handle remove favorite
  const handleRemoveFavorite = async (mangaId) => {
    try {
      await api.post('/favorites/remove', {
        userId: user._id,
        mangaId
      });
      
      setFavorites(prev => prev.filter(fav => fav.mangaId !== mangaId));
      setSuccess('ลบออกจากรายการโปรดแล้ว');
    } catch (err) {
      console.error('Error removing favorite:', err);
    }
  };

  // Handle clear history
  const handleClearHistory = async () => {
    if (!window.confirm('แน่ใจว่าต้องการล้างประวัติทั้งหมด?')) return;

    try {
      // This would require a new API endpoint
      // For now, we'll just clear the local state
      setHistory([]);
      setSuccess('ล้างประวัติแล้ว');
    } catch (err) {
      console.error('Error clearing history:', err);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 to-black text-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-700">
        {/* Header */}
        <div className="p-6 border-b border-gray-800 flex justify-between items-center">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <User size={28} />
            โปรไฟล์ของฉัน
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* Sidebar */}
          <div className="lg:w-1/3 p-6 border-r border-gray-800">
            {/* User Info */}
            <div className="text-center mb-8">
              <div className="relative inline-block mb-4">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-700">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-4xl font-bold">
                      {formData.username?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <label className="absolute bottom-2 right-2 p-2 bg-gray-800 rounded-full cursor-pointer hover:bg-gray-700">
                  <Camera size={20} />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </label>
              </div>
              
              <h3 className="text-xl font-bold">{formData.username}</h3>
              <p className="text-gray-400">@{formData.username}</p>
              
              {user?.isPremium ? (
                <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-black rounded-full font-bold">
                  <Crown size={16} />
                  VIP Member
                </div>
              ) : (
                <div className="mt-3 text-gray-400">Free Member</div>
              )}
              
              {user?.isAdmin && (
                <div className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 rounded-full font-bold">
                  <Shield size={16} />
                  Admin
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="text-center p-4 bg-gray-800/50 rounded-xl">
                <div className="text-2xl font-bold">{favorites.length}</div>
                <div className="text-gray-400 text-sm">รายการโปรด</div>
              </div>
              <div className="text-center p-4 bg-gray-800/50 rounded-xl">
                <div className="text-2xl font-bold">{history.length}</div>
                <div className="text-gray-400 text-sm">ประวัติ</div>
              </div>
            </div>

            {/* Navigation */}
            <div className="space-y-2">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full text-left p-3 rounded-lg transition-all ${
                  activeTab === 'profile'
                    ? 'bg-blue-600'
                    : 'hover:bg-gray-800'
                }`}
              >
                <User className="inline mr-3" size={20} />
                แก้ไขโปรไฟล์
              </button>
              
              <button
                onClick={() => setActiveTab('favorites')}
                className={`w-full text-left p-3 rounded-lg transition-all ${
                  activeTab === 'favorites'
                    ? 'bg-blue-600'
                    : 'hover:bg-gray-800'
                }`}
              >
                <Star className="inline mr-3" size={20} />
                รายการโปรด ({favorites.length})
              </button>
              
              <button
                onClick={() => setActiveTab('history')}
                className={`w-full text-left p-3 rounded-lg transition-all ${
                  activeTab === 'history'
                    ? 'bg-blue-600'
                    : 'hover:bg-gray-800'
                }`}
              >
                <History className="inline mr-3" size={20} />
                ประวัติการอ่าน ({history.length})
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="lg:w-2/3 p-6 max-h-[60vh] overflow-y-auto">
            {/* Messages */}
            {error && (
              <div className="mb-4 p-4 bg-red-900/30 border border-red-700 rounded-xl">
                <p className="text-red-300">{error}</p>
              </div>
            )}
            
            {success && (
              <div className="mb-4 p-4 bg-green-900/30 border border-green-700 rounded-xl">
                <p className="text-green-300">{success}</p>
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <form onSubmit={handleSubmit}>
                <h3 className="text-xl font-bold mb-6">แก้ไขข้อมูลส่วนตัว</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-400 mb-2">ชื่อผู้ใช้</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        className="w-full bg-gray-800 border border-gray-700 py-3 pl-10 pr-4 rounded-xl outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-gray-400 mb-2">อีเมล</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full bg-gray-800 border border-gray-700 py-3 pl-10 pr-4 rounded-xl outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-gray-400 mb-2">ชีวประวัติ</label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      rows="4"
                      placeholder="แนะนำตัวสั้นๆ..."
                      className="w-full bg-gray-800 border border-gray-700 py-3 px-4 rounded-xl outline-none focus:border-blue-500 resize-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-400 mb-2">วันที่สมัครสมาชิก</label>
                    <div className="flex items-center gap-2 text-gray-300">
                      <Calendar size={20} />
                      {formatDate(user?.lastActive || new Date())}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3 mt-8">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-3 bg-gray-800 rounded-xl font-semibold hover:bg-gray-700 transition-colors"
                  >
                    ยกเลิก
                  </button>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        กำลังบันทึก...
                      </div>
                    ) : (
                      <>
                        <Save className="inline mr-2" size={20} />
                        บันทึกการเปลี่ยนแปลง
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Favorites Tab */}
            {activeTab === 'favorites' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold">รายการโปรด</h3>
                  <span className="text-gray-400">{favorites.length} รายการ</span>
                </div>
                
                {favorites.length > 0 ? (
                  <div className="space-y-3">
                    {favorites.map(fav => (
                      <div
                        key={fav.mangaId}
                        className="flex items-center gap-4 p-4 bg-gray-800/30 rounded-xl hover:bg-gray-800/50 transition-all"
                      >
                        <img
                          src={fav.image}
                          alt={fav.title}
                          className="w-16 h-24 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h4 className="font-bold">{fav.title}</h4>
                          <div className="flex items-center gap-3 mt-1">
                            <div className="flex items-center gap-1 text-yellow-400">
                              <Star size={14} fill="currentColor" />
                              <span className="text-sm">{fav.score || 4.5}</span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveFavorite(fav.mangaId)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          title="ลบออกจากรายการโปรด"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Star className="mx-auto text-gray-400 mb-4" size={48} />
                    <p className="text-gray-400">ยังไม่มีรายการโปรด</p>
                    <p className="text-gray-500 text-sm mt-2">
                      กด❤️ในหน้าสำรวจเพื่อเพิ่มมังงะลงรายการโปรด
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold">ประวัติการอ่าน</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={handleClearHistory}
                      className="px-4 py-2 bg-red-900/30 text-red-400 rounded-lg hover:bg-red-800/30"
                    >
                      ล้างประวัติ
                    </button>
                  </div>
                </div>
                
                {history.length > 0 ? (
                  <div className="space-y-3">
                    {history.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-4 p-4 bg-gray-800/30 rounded-xl hover:bg-gray-800/50 transition-all"
                      >
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-16 h-24 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h4 className="font-bold">{item.title}</h4>
                          <div className="text-gray-400 text-sm mt-1">
                            อ่านตอนที่ {item.chapterCh} • {formatDate(item.lastRead)}
                          </div>
                        </div>
                        <button
                          onClick={() => window.open(`/reader/${item.mangaId}/${item.chapterId}/${item.chapterCh}`, '_blank')}
                          className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700"
                        >
                          อ่านต่อ
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <History className="mx-auto text-gray-400 mb-4" size={48} />
                    <p className="text-gray-400">ยังไม่มีประวัติการอ่าน</p>
                    <p className="text-gray-500 text-sm mt-2">
                      มังงะที่คุณอ่านจะปรากฏที่นี่
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;