import React, { useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components
import Navbar from './components/Navbar';
const AuthScreen = lazy(() => import('./components/AuthScreen'));
const MangaDisplay = lazy(() => import('./components/MangaDisplay'));
const MangaDetail = lazy(() => import('./components/MangaDetail'));
const Reader = lazy(() => import('./components/Reader'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));

const AppContent = () => {
  const { user, loading, logout } = useAuth();
  const [showProfile, setShowProfile] = useState(false);

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-green-500 font-bold animate-pulse">MANGAZONE LOADING...</div>;

  return (
    <div className="bg-black min-h-screen text-white">
      <ToastContainer theme="dark" position="bottom-right" />
      {user && <Navbar user={user} onLogout={logout} onOpenProfile={() => setShowProfile(true)} />}
      
      <main className="container mx-auto px-4">
        <Suspense fallback={<div className="p-20 text-center text-gray-500">กำลังโหลดเนื้อหา...</div>}>
          <Routes>
            <Route path="/login" element={!user ? <AuthScreen /> : <Navigate to="/" />} />
            <Route path="/" element={user ? <MangaDisplay /> : <Navigate to="/login" />} />
            <Route path="/manga/:id" element={user ? <MangaDetail /> : <Navigate to="/login" />} />
            <Route path="/reader/:mangaId/:chapterId/:chapterNum" element={user ? <Reader user={user} /> : <Navigate to="/login" />} />
            <Route path="/admin" element={user?.isAdmin ? <AdminDashboard /> : <Navigate to="/" />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
};

const App = () => (
  <AuthProvider>
    <Router><AppContent /></Router>
  </AuthProvider>
);

export default App;