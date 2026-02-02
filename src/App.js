import React, { useState, useEffect } from "react";
import axios from "axios";
import { History } from "lucide-react";

import AuthScreen from "./components/AuthScreen";
import AdminDashboard from "./components/AdminDashboard";
import Reader from "./components/Reader";
import PaymentModal from "./components/PaymentModal";
import Navbar from "./components/Navbar";
import ProfileModal from "./components/ProfileModal"; // อย่าลืมสร้างไฟล์นี้
import { Row, SectionGrid, GenreBar } from "./components/MangaDisplay";
import { API_URL, ImageWithFallback, isMangaPremium } from "./utils";

function AnimatedBackground() {
    const covers = ["https://cdn.myanimelist.net/images/manga/1/209347.jpg", "https://cdn.myanimelist.net/images/manga/2/253146.jpg", "https://cdn.myanimelist.net/images/manga/3/179897.jpg", "https://cdn.myanimelist.net/images/manga/1/157897.jpg", "https://cdn.myanimelist.net/images/manga/2/166124.jpg", "https://cdn.myanimelist.net/images/manga/1/120529.jpg"];
    return (<div className="fixed inset-0 grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 opacity-25 pointer-events-none overflow-hidden z-0">{covers.map((src, i) => (<div key={i} className="aspect-[2/3] bg-gray-900 rounded-lg overflow-hidden animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s`, animationFillMode: 'both' }}><img src={src} className="w-full h-full object-cover" alt="" /></div>))}<div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/90 to-[#121212]/40"></div></div>);
}

export default function App() {
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [selectedManga, setSelectedManga] = useState(null);
  const [chapterToStart, setChapterToStart] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [sectionView, setSectionView] = useState(null);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [searchQuery, setSearchQuery] = useState(null);

  useEffect(() => { const savedUser = localStorage.getItem("mangaAppUser"); if (savedUser) refreshUserData(JSON.parse(savedUser)); }, []);

  const refreshUserData = (u) => {
      axios.post(`${API_URL}/login`, { username: u.username, password: u.password }).then(res => { setUser(res.data); setHistory(res.data.history || []); })
      .catch((err) => { 
          if (err.response && (err.response.status === 401 || err.response.status === 403)) { if(u.username !== 'joshua') { setUser(null); localStorage.removeItem("mangaAppUser"); } else setUser(u); } 
          else { setUser(u); setHistory(u.history || []); } 
      });
  };

  const saveHistory = async (manga, chapter) => { try { const res = await axios.post(`${API_URL}/history`, { username: user.username, manga, chapter }); setHistory(res.data); } catch(e) {} };
  const handleReadClick = (manga, isPremiumContent = false, startChapter = null) => {
      const actuallyPremium = isMangaPremium(manga);
      if (actuallyPremium && !user.isPremium) { setShowPayment(true); return; }
      setChapterToStart(startChapter); setSelectedManga(manga);
  };
  const handleSearch = (q) => { setSearchQuery(q); setSelectedGenre(null); window.scrollTo(0,0); };
  const handleReset = () => { setSelectedGenre(null); setSearchQuery(null); window.scrollTo(0,0); };

  if (!user) return <AuthScreen onLogin={refreshUserData} />;

  return (
    <div className="bg-[#121212] min-h-screen font-sans pb-20 overflow-x-hidden text-white relative">
      <AnimatedBackground />
      <Navbar user={user} onSearch={handleSearch} setShowAdmin={setShowAdmin} onLogout={() => { localStorage.removeItem("mangaAppUser"); setUser(null); }} onReset={handleReset} onOpenProfile={() => setShowProfile(true)} />
      
      <header className="relative z-10 h-[35vh] flex items-end p-8 mt-16">
          <div className="max-w-2xl animate-fade-in-up">
              <h1 className="text-4xl font-extrabold mb-2 drop-shadow-lg text-white">Welcome back, <span className="text-green-500">{user.username}</span></h1>
              <p className="text-gray-200 drop-shadow-md font-medium">Premium Manga Collection & Community</p>
          </div>
      </header>

      <div className="-mt-6 relative z-20 space-y-6 pb-10 md:px-4">
          <div className="mb-10 px-2"><GenreBar onSelect={(g) => { setSelectedGenre(g); setSearchQuery(null); }} selectedId={selectedGenre?.id} /></div>

          {searchQuery ? (<SectionGrid title={`Search: "${searchQuery}"`} endpoint={`/manga?q=${searchQuery}&order_by=popularity&sort=asc&sfw`} onRead={handleReadClick} onClose={() => setSearchQuery(null)} />) 
          : selectedGenre ? (<SectionGrid title={`Category: ${selectedGenre.name}`} endpoint={`/manga?genres=${selectedGenre.id}&order_by=score&sort=desc`} onRead={handleReadClick} onClose={() => setSelectedGenre(null)} />) 
          : (
              <>
                {history.length > 0 && (
                    <div className="animate-fade-in-up mb-12 px-4 relative z-20">
                        <h2 className="text-xl font-bold mb-4 border-l-4 border-blue-500 pl-3 flex gap-2 items-center text-white drop-shadow-md"><History className="text-blue-500"/> Continue Reading</h2>
                        <div className="flex overflow-x-scroll gap-4 pb-4 scrollbar-hide">{history.map(h => (<div key={h.mal_id} onClick={() => handleReadClick(h, false, h)} className="cursor-pointer w-48 flex-shrink-0 bg-[#1e1e1e]/90 backdrop-blur rounded-lg p-3 flex gap-3 hover:bg-[#2a2a2a] transition border border-gray-700 shadow-xl"><ImageWithFallback src={h.image} className="w-16 h-24 object-cover rounded shadow-sm"/><div className="flex flex-col justify-center min-w-0"><p className="text-sm font-bold truncate text-white">{h.title}</p><p className="text-xs text-green-500 mt-1">Ep. {h.chapterCh}</p></div></div>))}</div>
                    </div>
                )}
                <Row title="🏆 Premium Selection" endpoint="/top/manga?filter=bypopularity" delay={0} onRead={handleReadClick} onSeeMore={(t,e)=>setSectionView({title:t, endpoint:e})} />
                <Row title="🇰🇷 Trending Manhwa" endpoint="/manga?type=manhwa&status=publishing&order_by=popularity" delay={1} onRead={handleReadClick} onSeeMore={(t,e)=>setSectionView({title:t, endpoint:e})} />
                <Row title="⚔️ Action Packed" endpoint="/manga?genres=1&order_by=popularity" delay={2} onRead={handleReadClick} onSeeMore={(t,e)=>setSectionView({title:t, endpoint:e})} />
                <Row title="💘 Romance" endpoint="/manga?genres=22&order_by=popularity" delay={3} onRead={handleReadClick} onSeeMore={(t,e)=>setSectionView({title:t, endpoint:e})} />
                <Row title="🌍 Isekai Adventures" endpoint="/manga?genres=62&order_by=popularity" delay={4} onRead={handleReadClick} onSeeMore={(t,e)=>setSectionView({title:t, endpoint:e})} />
                <Row title="🆕 Upcoming / New" endpoint="/manga?status=upcoming&order_by=popularity" delay={5} onRead={handleReadClick} onSeeMore={(t,e)=>setSectionView({title:t, endpoint:e})} />
              </>
          )}
      </div>

      {selectedManga && <Reader manga={selectedManga} chapterToStart={chapterToStart} onClose={() => { setSelectedManga(null); setChapterToStart(null); }} onSaveHistory={saveHistory} />}
      {sectionView && <SectionGrid title={sectionView.title} endpoint={sectionView.endpoint} onRead={handleReadClick} onClose={() => setSectionView(null)} />}
      {showPayment && <PaymentModal onClose={() => setShowPayment(false)} onConfirm={async () => { try { await axios.post(`${API_URL}/upgrade`, {username: user.username}); const updatedUser = { ...user, isPremium: true }; setUser(updatedUser); localStorage.setItem("mangaAppUser", JSON.stringify(updatedUser)); setShowPayment(false); alert("VIP Activated!"); } catch (err) { alert("Error"); } }} />}
      {showProfile && <ProfileModal user={user} onClose={() => setShowProfile(false)} onUpdate={(updatedUser) => { const finalUser = { ...updatedUser, password: user.password }; setUser(finalUser); localStorage.setItem("mangaAppUser", JSON.stringify(finalUser)); alert("Profile Updated!"); }} />}
      {showAdmin && <AdminDashboard onClose={() => setShowAdmin(false)} />}
    </div>
  );
}