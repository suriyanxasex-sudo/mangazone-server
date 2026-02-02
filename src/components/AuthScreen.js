import React, { useState } from "react";
import { Loader, Eye, EyeOff } from "lucide-react";
import { api } from "../utils"; // ✅ ใช้ api ตัวกลาง (เชื่อม Render อัตโนมัติ)

// 🎨 ส่วนพื้นหลังเคลื่อนไหว (คงเดิมไว้ เพราะสวยแล้ว)
function AnimatedBackground() {
    const covers = [
        "https://cdn.myanimelist.net/images/manga/1/209347.jpg", 
        "https://cdn.myanimelist.net/images/manga/2/253146.jpg", 
        "https://cdn.myanimelist.net/images/manga/3/179897.jpg", 
        "https://cdn.myanimelist.net/images/manga/1/157897.jpg", 
        "https://cdn.myanimelist.net/images/manga/2/166124.jpg", 
        "https://cdn.myanimelist.net/images/manga/1/120529.jpg"
    ];
    return (
        <div className="absolute inset-0 grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 opacity-30 pointer-events-none overflow-hidden">
            {covers.map((src, i) => (
                <div key={i} className="aspect-[2/3] bg-gray-800 rounded-lg overflow-hidden animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s`, animationFillMode: 'both' }}>
                    <img src={src} className="w-full h-full object-cover grayscale" alt="" />
                </div>
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/80 to-transparent"></div>
        </div>
    );
}

// 🔐 ส่วนระบบ Login (แก้ Logic ให้เชื่อม Server)
export default function AuthScreen({ setUser }) { // ✅ เปลี่ยน onLogin เป็น setUser
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    setLoading(true); 
    setError("");

    try {
      const endpoint = isRegister ? "/register" : "/login";
      
      // ✅ เรียกใช้ api.post (มันจะรู้เองว่าต้องไป Render)
      const { data } = await api.post(endpoint, { username, password });
      
      // ✅ บันทึกข้อมูลลงเครื่อง (ใช้ชื่อ 'user' ให้ตรงกันทั้งแอป)
      localStorage.setItem("user", JSON.stringify(data));
      
      // อัปเดตสถานะให้ App รู้
      if (setUser) setUser(data);
      
      // รีโหลดหน้าเว็บเพื่อให้ Navbar อัปเดต
      window.location.reload();

    } catch (err) { 
        console.error(err);
        setError(err.response?.data?.error || "Connection Error: ไม่สามารถติดต่อ Server ได้"); 
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-[#121212] relative overflow-hidden">
       <AnimatedBackground />
       <div className="bg-[#1e1e1e]/90 p-8 rounded-2xl w-full max-w-sm border border-gray-700 shadow-2xl backdrop-blur-md relative z-10 animate-fade-in-up">
          <div className="text-center mb-8">
              <h1 className="text-4xl font-extrabold text-white mb-2">Manga<span className="text-green-500">Zone</span></h1>
              <p className="text-gray-400 text-xs">Premium Manga Reader Platform</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
              <input 
                type="text" 
                placeholder="Username" 
                value={username} 
                onChange={e=>setUsername(e.target.value)} 
                className="w-full bg-[#121212] text-white border border-gray-600 rounded-lg p-3 outline-none focus:border-green-500 transition"
                required
              />
              <div className="relative">
                  <input 
                     type={showPassword ? "text" : "password"} 
                     placeholder="Password" 
                     value={password} 
                     onChange={e=>setPassword(e.target.value)} 
                     className="w-full bg-[#121212] text-white border border-gray-600 rounded-lg p-3 pr-10 outline-none focus:border-green-500 transition"
                     required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition">
                     {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                  </button>
              </div>
              {error && <div className="text-red-400 text-xs text-center bg-red-900/20 p-2 rounded border border-red-500/50">{error}</div>}
              <button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-lg transition shadow-lg disabled:opacity-50 flex justify-center items-center">
                 {loading ? <Loader className="animate-spin" size={24}/> : (isRegister ? "Create Account" : "Login")}
              </button>
          </form>
          <div className="mt-6 text-center">
              <p className="text-gray-400 text-sm">
                 {isRegister ? "Already a member?" : "New to MangaZone?"} 
                 <button onClick={() => {setIsRegister(!isRegister); setError("");}} className="text-green-500 font-bold ml-2 hover:underline">
                    {isRegister ? "Login" : "Sign Up"}
                 </button>
              </p>
          </div>
       </div>
    </div>
  );
}