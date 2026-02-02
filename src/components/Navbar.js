import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { 
  Home, 
  Search, 
  BookOpen, 
  User, 
  Crown, 
  LogOut, 
  Bell, 
  Menu, 
  X,
  TrendingUp,
  Bookmark,
  History
} from 'lucide-react';
import ProfileModal from './ProfileModal';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [showProfile, setShowProfile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Fetch notifications
  useEffect(() => {
    if (user) {
      // Mock notifications
      const mockNotifications = [
        { id: 1, message: 'มังงะใหม่ "Solo Leveling 2" ออกแล้ว!', time: '10 นาทีที่แล้ว', read: false },
        { id: 2, message: 'VIP ของคุณจะหมดอายุใน 3 วัน', time: '1 ชั่วโมงที่แล้ว', read: false },
        { id: 3, message: 'มีคนตอบกลับความคิดเห็นของคุณ', time: '2 วันที่แล้ว', read: true },
      ];
      setNotifications(mockNotifications);
    }
  }, [user]);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setShowMobileMenu(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    if (window.confirm('แน่ใจว่าต้องการออกจากระบบ?')) {
      logout();
    }
  };

  // Navigation items
  const navItems = [
    { path: '/', label: 'หน้าหลัก', icon: <Home size={20} /> },
    { path: '/trending', label: 'ยอดนิยม', icon: <TrendingUp size={20} /> },
    { path: '/library', label: 'คลังของฉัน', icon: <BookOpen size={20} /> },
    { path: '/favorites', label: 'รายการโปรด', icon: <Bookmark size={20} /> },
    { path: '/history', label: 'ประวัติ', icon: <History size={20} /> },
  ];

  // Unread notifications count
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="hidden md:flex sticky top-0 z-50 bg-gray-900/95 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto w-full px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <BookOpen size={24} />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 blur opacity-30"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                  MANGAZONE
                </h1>
                <p className="text-xs text-gray-400">อ่านมังงะฟรี</p>
              </div>
            </Link>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-8">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ค้นหามังงะ..."
                  className="w-full bg-gray-800/50 border border-gray-700 py-3 pl-12 pr-4 rounded-xl outline-none focus:border-blue-500 text-white placeholder-gray-500 backdrop-blur-sm"
                />
              </form>
            </div>

            {/* User Actions */}
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 rounded-lg hover:bg-gray-800 relative"
                >
                  <Bell size={22} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-xs rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowNotifications(false)}
                    />
                    <div className="absolute right-0 mt-2 w-80 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-50">
                      <div className="p-4 border-b border-gray-800">
                        <h3 className="font-bold">การแจ้งเตือน</h3>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.map(notification => (
                            <div
                              key={notification.id}
                              className={`p-4 border-b border-gray-800 hover:bg-gray-800 cursor-pointer ${
                                !notification.read ? 'bg-blue-900/20' : ''
                              }`}
                            >
                              <p className="font-medium">{notification.message}</p>
                              <p className="text-sm text-gray-400 mt-1">{notification.time}</p>
                            </div>
                          ))
                        ) : (
                          <div className="p-8 text-center text-gray-400">
                            ไม่มีการแจ้งเตือน
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* VIP Button */}
              {user && !user.isPremium && (
                <Link
                  to="/premium"
                  className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold rounded-lg hover:shadow-lg hover:scale-105 transition-all flex items-center gap-2"
                >
                  <Crown size={18} />
                  อัปเกรด VIP
                </Link>
              )}

              {/* Admin Button */}
              {user?.isAdmin && (
                <Link
                  to="/admin"
                  className="px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white font-bold rounded-lg hover:shadow-lg hover:scale-105 transition-all"
                >
                  👑 Admin
                </Link>
              )}

              {/* User Profile */}
              {user ? (
                <>
                  <button
                    onClick={() => setShowProfile(true)}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-800 transition-all"
                  >
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.username}
                        className="w-10 h-10 rounded-full object-cover border-2 border-gray-700"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-white">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="text-left hidden lg:block">
                      <div className="font-semibold">{user.username}</div>
                      <div className="text-xs text-gray-400">
                        {user.isPremium ? 'VIP Member' : 'Free Member'}
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-lg hover:bg-red-900/30 text-red-400 hover:text-red-300 transition-colors"
                    title="ออกจากระบบ"
                  >
                    <LogOut size={22} />
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all"
                >
                  เข้าสู่ระบบ
                </Link>
              )}
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex justify-center gap-6 mt-4">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  location.pathname === item.path
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600'
                    : 'hover:bg-gray-800'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile Navbar */}
      <nav className="md:hidden sticky top-0 z-50 bg-gray-900/95 backdrop-blur-md border-b border-gray-800">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <BookOpen size={18} />
              </div>
              <span className="font-bold">MANGAZONE</span>
            </Link>

            {/* Mobile Menu Button */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2"
              >
                <Bell size={22} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-[10px] rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="p-2 rounded-lg hover:bg-gray-800"
              >
                {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="mt-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหามังงะ..."
                className="w-full bg-gray-800/50 border border-gray-700 py-3 pl-10 pr-4 rounded-xl outline-none focus:border-blue-500 text-white placeholder-gray-500"
              />
            </div>
          </form>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setShowMobileMenu(false)}>
            <div
              className="absolute right-0 top-0 h-full w-64 bg-gray-900 border-l border-gray-800 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* User Info */}
              {user ? (
                <div className="p-4 border-b border-gray-800">
                  <div className="flex items-center gap-3 mb-4">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.username}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-white">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="font-bold">{user.username}</div>
                      <div className="text-sm text-gray-400">
                        {user.isPremium ? 'VIP Member' : 'Free Member'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setShowProfile(true);
                        setShowMobileMenu(false);
                      }}
                      className="px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700"
                    >
                      โปรไฟล์
                    </button>
                    <button
                      onClick={handleLogout}
                      className="px-4 py-2 bg-red-900/30 text-red-400 rounded-lg hover:bg-red-800"
                    >
                      ออกจากระบบ
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 border-b border-gray-800">
                  <Link
                    to="/login"
                    className="block w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-center font-bold"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    เข้าสู่ระบบ
                  </Link>
                </div>
              )}

              {/* Navigation Links */}
              <div className="p-2">
                {navItems.map(item => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 p-3 rounded-lg mb-1 ${
                      location.pathname === item.path
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600'
                        : 'hover:bg-gray-800'
                    }`}
                    onClick={() => setShowMobileMenu(false)}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>

              {/* VIP Section */}
              {user && !user.isPremium && (
                <div className="p-4 border-t border-gray-800">
                  <Link
                    to="/premium"
                    className="block w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold rounded-xl text-center"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <Crown className="inline mr-2" size={18} />
                    อัปเกรดเป็น VIP
                  </Link>
                </div>
              )}

              {/* Admin Link */}
              {user?.isAdmin && (
                <div className="p-4 border-t border-gray-800">
                  <Link
                    to="/admin"
                    className="block w-full py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white font-bold rounded-xl text-center"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    👑 Admin Panel
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Profile Modal */}
      {showProfile && (
        <ProfileModal onClose={() => setShowProfile(false)} />
      )}
    </>
  );
};

export default Navbar;