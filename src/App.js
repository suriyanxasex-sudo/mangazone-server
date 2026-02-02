import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { api } from './utils';

// Import ทุกคอมโพเนนต์ที่เราเคยทำ
import AuthScreen from './components/AuthScreen';
import Navbar from './components/Navbar';
import MangaDisplay from './components/MangaDisplay';
import Reader from './components/Reader';
import AdminDashboard from './components/AdminDashboard';
import ProfileModal from './components/ProfileModal';
import PaymentModal from './components/PaymentModal';

const App = () => {
  const [user, setUser] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      let userData = JSON.parse(savedUser);
      // 🔥 ฟีเจอร์ Force Admin สำหรับ Joshua
      if (userData.username === 'joshua') {
        userData.isAdmin = true;
      }
      setUser(userData);
    }
  }, []);

  if (!user) return <AuthScreen setUser={setUser} />;

  return (
    <Router>
      <div className="bg-black min-h-screen text-white font-sans">
        <Navbar 
          user={user} 
          setUser={setUser} 
          onOpenProfile={() => setShowProfile(true)} 
          onOpenVIP={() => setShowPayment(true)} 
        />
        <Routes>
          <Route path="/" element={<MangaDisplay user={user} />} />
          <Route path="/reader/:mangaId/:chapterId" element={<Reader user={user} />} />
          {/* หน้าแอดมินจะเข้าได้เฉพาะ joshua เท่านั้น */}
          <Route path="/admin" element={user.isAdmin ? <AdminDashboard user={user} /> : <Navigate to="/" />} />
        </Routes>
        {showProfile && <ProfileModal user={user} setUser={setUser} onClose={() => setShowProfile(false)} />}
        {showPayment && <PaymentModal user={user} setUser={setUser} onClose={() => setShowPayment(false)} />}
      </div>
    </Router>
  );
};
export default App;