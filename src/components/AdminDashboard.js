import React, { useState, useEffect } from "react";
import axios from "axios";
import { Shield, X, Crown, Ban, Trash2 } from "lucide-react";
import { API_URL, timeAgo } from "../utils";

export default function AdminDashboard({ onClose }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchData = () => { axios.get(`${API_URL}/admin/users`).then(res => setUsers(res.data)).catch(console.error); };
    fetchData(); 
    const interval = setInterval(fetchData, 2000); 
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (targetId, action) => {
    if(!window.confirm(`Confirm action: ${action}?`)) return;
    try { const res = await axios.post(`${API_URL}/admin/manage`, { targetId, action }); setUsers(res.data); } catch (err) { alert("Error"); }
  };

  const formatDate = (dateString) => {
      if (!dateString) return "Lifetime";
      return new Date(dateString).toLocaleDateString('th-TH');
  };

  return (
    <div className="fixed inset-0 bg-[#121212] z-[60] p-6 overflow-y-auto animate-fade-in text-white">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-green-500 flex items-center gap-2"><Shield/> Admin Command Center</h1>
          <button onClick={onClose} className="bg-gray-800 p-2 rounded-full hover:bg-gray-700"><X/></button>
        </div>
        <div className="bg-[#1e1e1e] rounded-xl overflow-hidden border border-gray-700 shadow-2xl">
          <table className="w-full text-left border-collapse">
            <thead className="bg-black/50 text-gray-400 text-sm uppercase">
              <tr><th className="p-4">User</th><th className="p-4">Status</th><th className="p-4">VIP Expires</th><th className="p-4 text-center">Action</th></tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id} className="border-t border-gray-700 hover:bg-white/5 transition">
                    <td className="p-4 flex items-center gap-3">
                        <div className="relative">
                            <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center font-bold">{u.username[0].toUpperCase()}</div>
                            <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-[#1e1e1e] ${ (new Date() - new Date(u.lastActive)) < 5 * 60 * 1000 ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                        </div>
                        <span className={u.isAdmin ? "text-blue-400 font-bold" : "text-white"}>{u.username}</span>
                    </td>
                    <td className="p-4">{u.isBanned ? <span className="text-red-500 font-bold">BANNED</span> : "Active"}</td>
                    <td className="p-4 text-xs text-yellow-200">
                        {u.isPremium ? <span className="flex items-center gap-1 bg-yellow-500/10 border border-yellow-500/30 px-2 py-1 rounded"><Crown size={12}/> {formatDate(u.premiumExpiresAt)}</span> : "-"}
                    </td>
                    <td className="p-4 flex gap-2 justify-center">
                        <button onClick={() => handleAction(u._id, 'toggle_vip')} className="p-2 bg-yellow-500/10 text-yellow-500 rounded hover:bg-yellow-500 hover:text-black"><Crown size={16}/></button>
                        <button onClick={() => handleAction(u._id, 'toggle_ban')} className="p-2 bg-red-500/10 text-red-500 rounded hover:bg-red-500 hover:text-white"><Ban size={16}/></button>
                        {!u.isAdmin && <button onClick={() => handleAction(u._id, 'delete')} className="p-2 bg-gray-700 text-gray-400 rounded hover:bg-red-600 hover:text-white"><Trash2 size={16}/></button>}
                    </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}