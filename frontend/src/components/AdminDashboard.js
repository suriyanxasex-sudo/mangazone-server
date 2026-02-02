import React, { useEffect, useState } from 'react';
import { api } from '../utils';
import { Users, Crown, Trash2, RefreshCw, Shield, Ban, CheckCircle, XCircle, BarChart, Activity } from 'lucide-react';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    vipUsers: 0,
    activeUsers: 0,
    bannedUsers: 0
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Fetch users and statistics
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/users');
      setUsers(data);
      
      // Calculate statistics
      const vipUsers = data.filter(u => u.isPremium).length;
      const bannedUsers = data.filter(u => u.isBanned).length;
      const activeUsers = data.filter(u => 
        new Date(u.lastActive) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length;
      
      setStats({
        totalUsers: data.length,
        vipUsers,
        activeUsers,
        bannedUsers
      });
      
      setMessage({ type: 'success', text: 'โหลดข้อมูลผู้ใช้สำเร็จ!' });
    } catch (err) {
      console.error("Fetch error:", err);
      setMessage({ type: 'error', text: 'ไม่สามารถโหลดข้อมูลผู้ใช้ได้' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle user actions
  const handleUserAction = async (userId, action) => {
    try {
      const { data } = await api.post('/admin/manage', { 
        targetId: userId, 
        action 
      });
      
      setUsers(data);
      
      // Update stats
      const vipUsers = data.filter(u => u.isPremium).length;
      const bannedUsers = data.filter(u => u.isBanned).length;
      
      setStats(prev => ({
        ...prev,
        vipUsers,
        bannedUsers
      }));
      
      setMessage({ 
        type: 'success', 
        text: `ดำเนินการ ${getActionName(action)} สำเร็จ!` 
      });
    } catch (err) {
      setMessage({ type: 'error', text: "ไม่สามารถดำเนินการได้" });
    }
  };

  // Get action name in Thai
  const getActionName = (action) => {
    switch(action) {
      case 'toggle_vip': return 'เปลี่ยนสถานะ VIP';
      case 'toggle_ban': return 'เปลี่ยนสถานะแบน';
      case 'delete': return 'ลบผู้ใช้';
      default: return 'ดำเนินการ';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
              <Shield className="text-blue-500" size={36} />
              <span>Admin Control Panel</span>
            </h1>
            <p className="text-gray-400 mt-2">จัดการระบบและผู้ใช้งานทั้งหมด</p>
          </div>
          
          <button 
            onClick={fetchUsers}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all hover:scale-105 disabled:opacity-50"
          >
            <RefreshCw className={loading ? 'animate-spin' : ''} size={20} />
            {loading ? 'กำลังโหลด...' : 'รีเฟรชข้อมูล'}
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 hover:border-blue-500 transition-all">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 text-sm">ผู้ใช้ทั้งหมด</p>
                <p className="text-3xl font-bold mt-2">{stats.totalUsers}</p>
              </div>
              <Users className="text-blue-400" size={24} />
            </div>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 hover:border-yellow-500 transition-all">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 text-sm">สมาชิก VIP</p>
                <p className="text-3xl font-bold mt-2 text-yellow-400">{stats.vipUsers}</p>
              </div>
              <Crown className="text-yellow-400" size={24} />
            </div>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 hover:border-green-500 transition-all">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 text-sm">ผู้ใช้活跃 (7 วัน)</p>
                <p className="text-3xl font-bold mt-2 text-green-400">{stats.activeUsers}</p>
              </div>
              <Activity className="text-green-400" size={24} />
            </div>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 hover:border-red-500 transition-all">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 text-sm">บัญชีถูกแบน</p>
                <p className="text-3xl font-bold mt-2 text-red-400">{stats.bannedUsers}</p>
              </div>
              <Ban className="text-red-400" size={24} />
            </div>
          </div>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-xl border ${
            message.type === 'success' 
              ? 'bg-green-900/30 border-green-700 text-green-300' 
              : 'bg-red-900/30 border-red-700 text-red-300'
          }`}>
            {message.text}
          </div>
        )}

        {/* Users Table */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Users size={24} />
              รายชื่อผู้ใช้งานทั้งหมด
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="p-4 text-left">ผู้ใช้</th>
                  <th className="p-4 text-left">สถานะ</th>
                  <th className="p-4 text-left">ใช้งานล่าสุด</th>
                  <th className="p-4 text-left">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="p-8 text-center">
                      <div className="flex justify-center">
                        <RefreshCw className="animate-spin text-blue-500" size={24} />
                      </div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-gray-400">
                      ไม่พบข้อมูลผู้ใช้
                    </td>
                  </tr>
                ) : (
                  users.map(user => (
                    <tr 
                      key={user._id} 
                      className="hover:bg-gray-800/50 transition-all cursor-pointer"
                      onClick={() => setSelectedUser(user)}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {user.avatar ? (
                            <img 
                              src={user.avatar} 
                              alt={user.username}
                              className="w-10 h-10 rounded-full object-cover border border-gray-600"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold">
                              {user.username.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="font-semibold">{user.username}</div>
                            <div className="text-sm text-gray-400">ID: {user._id?.slice(-8)}</div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className="flex flex-wrap gap-2">
                          {user.isAdmin && (
                            <span className="px-2 py-1 bg-blue-900/50 text-blue-300 text-xs rounded-full">
                              👑 Admin
                            </span>
                          )}
                          {user.isPremium ? (
                            <span className="px-2 py-1 bg-yellow-900/50 text-yellow-300 text-xs rounded-full flex items-center gap-1">
                              <Crown size={12} /> VIP
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-full">
                              Free
                            </span>
                          )}
                          {user.isBanned && (
                            <span className="px-2 py-1 bg-red-900/50 text-red-300 text-xs rounded-full">
                              ⛔ Banned
                            </span>
                          )}
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className="text-sm">
                          {formatDate(user.lastActive)}
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUserAction(user._id, 'toggle_vip');
                            }}
                            className={`p-2 rounded-lg transition-all ${
                              user.isPremium 
                                ? 'bg-yellow-900/30 text-yellow-400 hover:bg-yellow-800' 
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                            title={user.isPremium ? 'ยกเลิก VIP' : 'ให้สิทธิ์ VIP'}
                          >
                            <Crown size={18} />
                          </button>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUserAction(user._id, 'toggle_ban');
                            }}
                            className={`p-2 rounded-lg transition-all ${
                              user.isBanned 
                                ? 'bg-green-900/30 text-green-400 hover:bg-green-800' 
                                : 'bg-red-900/30 text-red-400 hover:bg-red-800'
                            }`}
                            title={user.isBanned ? 'ปลดแบน' : 'แบนผู้ใช้'}
                          >
                            <Ban size={18} />
                          </button>
                          
                          {!user.isAdmin && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm(`แน่ใจว่าต้องการลบผู้ใช้ "${user.username}"?`)) {
                                  handleUserAction(user._id, 'delete');
                                }
                              }}
                              className="p-2 rounded-lg bg-red-900/30 text-red-400 hover:bg-red-800 transition-all"
                              title="ลบผู้ใช้"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* User Detail Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 rounded-2xl max-w-md w-full border border-gray-700">
              <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                <h3 className="text-xl font-bold">รายละเอียดผู้ใช้</h3>
                <button 
                  onClick={() => setSelectedUser(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              
              <div className="p-6">
                <div className="flex flex-col items-center mb-6">
                  {selectedUser.avatar ? (
                    <img 
                      src={selectedUser.avatar} 
                      alt={selectedUser.username}
                      className="w-24 h-24 rounded-full object-cover border-4 border-gray-700 mb-4"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold mb-4">
                      {selectedUser.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <h4 className="text-2xl font-bold">{selectedUser.username}</h4>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-gray-400 text-sm">สถานะบัญชี</label>
                    <div className="flex gap-2 mt-1">
                      {selectedUser.isAdmin && (
                        <span className="px-3 py-1 bg-blue-900 text-blue-300 text-sm rounded-full">
                          ผู้ดูแลระบบ
                        </span>
                      )}
                      {selectedUser.isPremium && (
                        <span className="px-3 py-1 bg-yellow-900 text-yellow-300 text-sm rounded-full">
                          สมาชิก VIP
                        </span>
                      )}
                      {selectedUser.isBanned && (
                        <span className="px-3 py-1 bg-red-900 text-red-300 text-sm rounded-full">
                          ถูกระงับการใช้งาน
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-gray-400 text-sm">ใช้งานล่าสุด</label>
                    <p className="mt-1">{formatDate(selectedUser.lastActive)}</p>
                  </div>
                  
                  <div>
                    <label className="text-gray-400 text-sm">รายการโปรด</label>
                    <p className="mt-1">{selectedUser.favorites?.length || 0} รายการ</p>
                  </div>
                  
                  <div>
                    <label className="text-gray-400 text-sm">ประวัติการอ่าน</label>
                    <p className="mt-1">{selectedUser.history?.length || 0} รายการ</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 border-t border-gray-700 flex justify-end gap-3">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600"
                >
                  ปิด
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;