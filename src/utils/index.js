import axios from "axios";
import React, { useState } from "react";

// ✅ เชื่อมต่อ Backend บน Render
export const API_URL = "https://mangazone-api.onrender.com/api";
export const api = axios.create({ baseURL: API_URL });

// ✅ ตัวช่วยแสดงรูป (ที่ทำให้เกิด Error ตะกี้)
export const ImageWithFallback = ({ src, alt, className }) => {
  const [error, setError] = useState(false);
  return (
    <img 
      src={error || !src ? "https://placehold.co/400x600/1e1e1e/FFF?text=No+Cover" : src} 
      alt={alt} 
      className={className} 
      onError={() => setError(true)} 
    />
  );
};

// ✅ ตัวช่วยบอกเวลา
export const timeAgo = (date) => {
    if (!date) return "";
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
};