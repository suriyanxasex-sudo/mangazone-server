import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { api } from '../utils';
import { User, Lock, Zap, Eye, EyeOff, AlertCircle, Check } from 'lucide-react';

const AuthScreen = () => {
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    setSuccess('');
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      setError('กรุณากรอกชื่อผู้ใช้');
      return false;
    }
    if (!formData.password) {
      setError('กรุณากรอกรหัสผ่าน');
      return false;
    }
    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError('รหัสผ่านไม่ตรงกัน');
      return false;
    }
    if (!isLogin && formData.password.length < 6) {
      setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const endpoint = isLogin ? '/login' : '/register';
      const { data } = await api.post(endpoint, {
        username: formData.username,
        password: formData.password
      });

      login({
        _id: data._id,
        username: data.username,
        isAdmin: data.isAdmin,
        isPremium: data.isPremium,
        avatar: data.avatar
      });

      setSuccess(isLogin ? 'เข้าสู่ระบบสำเร็จ!' : 'สมัครสมาชิกสำเร็จ!');
      
      // Redirect after success
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);

    } catch (err) {
      const errorMessage = err.response?.data?.error || 
                          (isLogin ? 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' : 'สมัครสมาชิกไม่สำเร็จ');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Quick login for testing
  const handleQuickLogin = (username, password) => {
    setFormData({ username, password });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"></div>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Zap className="text-blue-500 animate-pulse" size={48} />
              <div className="absolute inset-0 bg-blue-500/20 blur-xl"></div>
            </div>
          </div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            MANGA<span className="text-white">ZONE</span>
          </h1>
          <p className="text-gray-400 mt-2">เข้าโลกมังงะแบบไม่มีขีดจำกัด</p>
        </div>

        {/* Form Card */}
        <div className="bg-gray-900/50 backdrop-blur-lg rounded-2xl border border-gray-700/50 p-8 shadow-2xl">
          {/* Toggle */}
          <div className="flex mb-8 bg-gray-800/50 rounded-xl p-1">
            <button
              className={`flex-1 py-3 rounded-lg text-center font-semibold transition-all ${
                isLogin 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => setIsLogin(true)}
            >
              เข้าสู่ระบบ
            </button>
            <button
              className={`flex-1 py-3 rounded-lg text-center font-semibold transition-all ${
                !isLogin 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => setIsLogin(false)}
            >
              สมัครสมาชิก
            </button>
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-900/30 border border-red-700 rounded-xl flex items-start gap-3">
              <AlertCircle className="text-red-400 mt-0.5" size={20} />
              <p className="text-red-300">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="mb-6 p-4 bg-green-900/30 border border-green-700 rounded-xl flex items-start gap-3">
              <Check className="text-green-400 mt-0.5" size={20} />
              <p className="text-green-300">{success}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <div>
              <label className="block text-gray-400 text-sm mb-2">ชื่อผู้ใช้</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="กรอกชื่อผู้ใช้"
                  className="w-full bg-black/30 border border-gray-700 py-4 pl-12 pr-4 rounded-xl outline-none focus:border-blue-500 text-white placeholder-gray-500"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-gray-400 text-sm mb-2">รหัสผ่าน</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="กรอกรหัสผ่าน"
                  className="w-full bg-black/30 border border-gray-700 py-4 pl-12 pr-12 rounded-xl outline-none focus:border-blue-500 text-white placeholder-gray-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Confirm Password (Register only) */}
            {!isLogin && (
              <div>
                <label className="block text-gray-400 text-sm mb-2">ยืนยันรหัสผ่าน</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="กรอกรหัสผ่านอีกครั้ง"
                    className="w-full bg-black/30 border border-gray-700 py-4 pl-12 pr-4 rounded-xl outline-none focus:border-blue-500 text-white placeholder-gray-500"
                    required
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  {isLogin ? 'กำลังเข้าสู่ระบบ...' : 'กำลังสมัครสมาชิก...'}
                </div>
              ) : (
                isLogin ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'
              )}
            </button>
          </form>

          {/* Quick Login (Dev Only) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-8 pt-6 border-t border-gray-700/50">
              <p className="text-gray-400 text-sm mb-3">ทดลองระบบ (Development Only):</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleQuickLogin('joshua', '7465')}
                  className="px-3 py-2 bg-blue-900/30 hover:bg-blue-800/50 text-blue-300 text-sm rounded-lg border border-blue-700/50"
                >
                  👑 Admin (Joshua)
                </button>
                <button
                  onClick={() => handleQuickLogin('testuser', '123456')}
                  className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-lg border border-gray-700"
                >
                  👤 Test User
                </button>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              {isLogin 
                ? "ยังไม่มีบัญชี? สมัครสมาชิกฟรี" 
                : "มีบัญชีอยู่แล้ว? เข้าสู่ระบบ"}
            </button>
            
            <p className="text-gray-500 text-sm mt-4">
              โดยการเข้าสู่ระบบหรือสมัครสมาชิก คุณยอมรับ
              <a href="#" className="text-blue-400 hover:underline ml-1">
                ข้อตกลงและเงื่อนไข
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;