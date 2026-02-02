import React, { useEffect, useState } from 'react';
import { api } from '../utils';

const AdminDashboard = ({ user }) => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await api.get('/admin/users');
        setUsers(data);
      } catch (err) { console.error(err); }
    };
    fetchUsers();
  }, []);

  const handleAction = async (targetId, action) => {
    try {
      const { data } = await api.post('/admin/manage', { targetId, action });
      setUsers(data);
    } catch (err) { console.error(err); }
  };

  if (!user?.isAdmin) return <div>Access Denied</div>;

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-green-400">Admin Dashboard</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-white">
          <thead className="bg-gray-800">
            <tr>
              <th className="p-3">User</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id} className="border-b border-gray-700">
                <td className="p-3">{u.username} {u.isAdmin && '👑'}</td>
                <td className="p-3">{u.isPremium ? 'VIP 🌟' : 'Free'}</td>
                <td className="p-3 gap-2 flex">
                  <button onClick={() => handleAction(u._id, 'toggle_vip')} className="bg-yellow-600 px-2 py-1 rounded text-xs">Toggle VIP</button>
                  <button onClick={() => handleAction(u._id, 'delete')} className="bg-red-600 px-2 py-1 rounded text-xs">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;