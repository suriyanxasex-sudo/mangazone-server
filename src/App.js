import React, { useState, useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import Components
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
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // โหลดข้อมูล User และเช็คสถานะพิเศษของ Joshua
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        let userData = JSON.parse(savedUser);
        if (userData.username.toLowerCase() === 'joshua') {
          userData.isAdmin = true; // Force Admin สิทธิ์พิเศษของคุณ
        }
        setUser(userData);
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
    setIsInitializing(false);
  }, []);

  if (isInitializing) return (
    <div className="bg-black min-h-screen flex flex-col items-center justify-center">
      <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-green-500 font-bold tracking-widest">MANGZONE INITIALIZING...</p>
    </div>
  );

  // ถ้ายังไม่ล็อกอิน ให้ไปหน้า Login ดีไซน์สวยๆ
  if (!user) return <AuthScreen setUser={setUser} />;

  return (
    <Router>
      <div className="bg-black min-h-screen text-white font-sans selection:bg-green-500/40">
        <Navbar 
          user={user} 
          setUser={setUser} 
          onOpenProfile={() => setShowProfile(true)} 
          onOpenVIP={() => setShowPayment(true)} 
        />
        
        <Suspense fallback={<div className="p-10 text-center">Loading Content...</div>}>
          <Routes>
            <Route path="/" element={<MangaDisplay user={user} />} />
            <Route path="/reader/:mangaId/:chapterId" element={<Reader user={user} />} />
            {/* ระบบป้องกันหน้า Admin: ต้องเป็น joshua เท่านั้น */}
            <Route path="/admin" element={user.isAdmin ? <AdminDashboard /> : <Navigate to="/" />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Suspense>

        {/* Modals ต่างๆ ที่เราทำมากัน */}
        {showProfile && <ProfileModal user={user} setUser={setUser} onClose={() => setShowProfile(false)} />}
        {showPayment && <PaymentModal user={user} setUser={setUser} onClose={() => setShowPayment(false)} />}
      </div>
    </Router>
  );
};

export default App;