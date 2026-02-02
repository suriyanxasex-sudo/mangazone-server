import axios from "axios";
import React, { useState } from "react";

// ✅ ใช้ลิงก์ Render เท่านั้น
export const API_URL = "https://mangazone-api.onrender.com/api";
export const api = axios.create({ baseURL: API_URL });

export const ImageWithFallback = ({ src, alt, className }) => {
  const [error, setError] = useState(false);
  return <img src={error || !src ? "https://placehold.co/400x600/1e1e1e/FFF?text=No+Cover" : src} alt={alt} className={className} onError={() => setError(true)} />;
};

export const timeAgo = (date) => {
    if (!date) return "";
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000; if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 86400; if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600; if (interval > 1) return Math.floor(interval) + "h ago";
    return "Just now";
};