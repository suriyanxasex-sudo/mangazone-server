import React, { useState } from 'react';
import { api } from '../utils';

const ProfileModal = ({ user, setUser, onClose }) => {
  const [newUsername, setNewUsername] = useState(user.username);
  const [newAvatar, setNewAvatar] = useState(user.avatar || '');
  
  const handleUpdate = async () => {
    try {
      const { data } = await api.put('/user/update', { 
        userId: user._id, 
        newUsername, 
        newAvatar 
      });
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
      onClose();
    } catch (err) {
      alert("Update failed: " + (err.response?.data?.error || err.message));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setNewAvatar(reader.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-gray-900 p-6 rounded-lg w-96 border border-gray-700 text-white">
        <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
        <input type="text" value={newUsername} onChange={(e)=>setNewUsername(e.target.value)} className="w-full p-2 mb-3 bg-gray-800 rounded border border-gray-700 text-white" />
        <input type="file" onChange={handleFileChange} className="mb-4 text-sm text-gray-400" />
        {newAvatar && <img src={newAvatar} alt="Preview" className="w-20 h-20 rounded-full mx-auto mb-4 object-cover" />}
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-700 rounded">Cancel</button>
          <button onClick={handleUpdate} className="px-4 py-2 bg-green-600 rounded">Save</button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;