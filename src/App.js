import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import ส่วนประกอบต่างๆ
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // เช็คว่าเคยล็อกอินค้างไว้ไหม
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  if (loading) return <div className="bg-black min-h-screen text-white flex items-center justify-center">Loading...</div>;

  // ถ้ายังไม่ล็อกอิน ให้โชว์หน้า Auth (Login/Register)
  if (!user) {
    return <AuthScreen setUser={setUser} />;
  }

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
          <Route path="/admin" element={user.isAdmin ? <AdminDashboard user={user} /> : <Navigate to="/" />} />
        </Routes>

        {showProfile && <ProfileModal user={user} setUser={setUser} onClose={() => setShowProfile(false)} />}
        {showPayment && <PaymentModal user={user} setUser={setUser} onClose={() => setShowPayment(false)} />}
      </div>
    </Router>
  );
};

export default App;