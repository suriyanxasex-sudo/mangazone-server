import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Navbar = lazy(() => import('./components/Navbar'));
const AuthScreen = lazy(() => import('./components/AuthScreen'));
const MangaDisplay = lazy(() => import('./components/MangaDisplay'));
const MangaDetail = lazy(() => import('./components/MangaDetail'));
const Reader = lazy(() => import('./components/Reader'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && !user.isAdmin) return <Navigate to="/" />;
  return children;
};

const AppContent = () => {
  const { user } = useAuth();
  return (
    <div className="bg-black min-h-screen text-white">
      <ToastContainer theme="dark" position="bottom-right" />
      {user && <Navbar />}
      <Suspense fallback={<div className="h-screen flex items-center justify-center animate-pulse text-green-500">LOADING MANGZONE...</div>}>
        <Routes>
          <Route path="/login" element={!user ? <AuthScreen /> : <Navigate to="/" />} />
          <Route path="/" element={<ProtectedRoute><MangaDisplay /></ProtectedRoute>} />
          <Route path="/manga/:id" element={<ProtectedRoute><MangaDetail /></ProtectedRoute>} />
          <Route path="/reader/:mangaId/:chapterId/:chapterNum" element={<ProtectedRoute><Reader /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
        </Routes>
      </Suspense>
    </div>
  );
};

const App = () => (
  <AuthProvider>
    <Router><AppContent /></Router>
  </AuthProvider>
);

export default App;const AuthScreen = lazy(() =
const MangaDisplay = lazy(() =
const MangaDetail = lazy(() =
const Reader = lazy(() =
const AdminDashboard = lazy(() =
 
const ProtectedRoute = ({ children, adminOnly = false }) =
  const { user, loading } = useAuth(); 
  if (loading) return null; 
  if (!user) return <Navigate to="/login" />; 
  return children; 
}; 
 
const AppContent = () =
  const { user } = useAuth(); 
  return ( 
    <div className="bg-black min-h-screen text-white"> 
      <ToastContainer theme="dark" position="bottom-right" /> 
      <Suspense fallback={<div className="h-screen flex items-center justify-center animate-pulse text-green-500">LOADING MANGZONE...</div>}> 
        <Routes> 
          <Route path="/login" element={!user ? <AuthScreen /> : <Navigate to="/" />} /> 
          <Route path="/" element={<ProtectedRoute><MangaDisplay /></ProtectedRoute>} /> 
          <Route path="/manga/:id" element={<ProtectedRoute><MangaDetail /></ProtectedRoute>} /> 
          <Route path="/reader/:mangaId/:chapterId/:chapterNum" element={<ProtectedRoute><Reader /></ProtectedRoute>} /> 
          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} /> 
        </Routes> 
      </Suspense> 
    </div> 
  ); 
}; 
 
const App = () =
  <AuthProvider> 
    <Router><AppContent /></Router> 
  </AuthProvider> 
); 
 
export default App; 
