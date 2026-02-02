import React, { useState } from "react";
import axios from "axios";
import { X, Save, User, Image as ImageIcon, Loader, Upload } from "lucide-react";
import { API_URL } from "../utils";

export default function ProfileModal({ user, onClose, onUpdate }) {
    const [newUsername, setNewUsername] = useState(user.username);
    const [newAvatar, setNewAvatar] = useState(user.avatar || "");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // ฟังก์ชันแปลงไฟล์เป็น Base64
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // จำกัดขนาดไม่เกิน 2MB (เพื่อไม่ให้ Database หนักเกิน)
        if (file.size > 2 * 1024 * 1024) {
            setError("File too large (Max 2MB)");
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => {
            setNewAvatar(reader.result); // ได้ String ยาวๆ มาใส่ในตัวแปร
            setError("");
        };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await axios.put(`${API_URL}/user/update`, {
                userId: user._id,
                newUsername,
                newAvatar
            });
            onUpdate(res.data);
            onClose();
        } catch (err) {
            setError(err.response?.data?.error || "Update failed");
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/90 z-[70] flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-[#1e1e1e] text-white p-6 rounded-2xl max-w-sm w-full relative border border-gray-700 shadow-2xl">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X /></button>
                
                <h2 className="text-2xl font-bold mb-6 text-center">Edit Profile</h2>

                <div className="flex flex-col items-center mb-6">
                    <div className="w-24 h-24 rounded-full border-2 border-green-500 overflow-hidden bg-gray-800 mb-3 relative group">
                        <img 
                            src={newAvatar || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"} 
                            alt="Avatar" 
                            className="w-full h-full object-cover"
                        />
                        {/* Overlay เมื่อเอาเมาส์ชี้ */}
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer">
                            <Upload size={24} className="text-white"/>
                        </div>
                        {/* Input ไฟล์ซ่อนอยู่ */}
                        <input 
                            type="file" 
                            accept="image/*" 
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={handleImageUpload}
                        />
                    </div>
                    <p className="text-xs text-gray-400">Click image to upload</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-xs text-gray-400 mb-1 block flex items-center gap-1"><User size={12}/> Username</label>
                        <input 
                            type="text" 
                            value={newUsername} 
                            onChange={e => setNewUsername(e.target.value)}
                            className="w-full bg-[#121212] border border-gray-600 rounded p-2 text-sm outline-none focus:border-green-500"
                        />
                    </div>

                    {error && <p className="text-red-400 text-xs text-center">{error}</p>}

                    <button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-500 py-2 rounded font-bold flex items-center justify-center gap-2">
                        {loading ? <Loader className="animate-spin" size={16}/> : <><Save size={16}/> Save Changes</>}
                    </button>
                </form>
            </div>
        </div>
    );
}