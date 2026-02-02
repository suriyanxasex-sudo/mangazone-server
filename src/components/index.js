// src/utils/index.js
import React, { useState } from "react";

export const API_URL = "http://localhost:5000/api";
export const JIKAN_URL = "https://api.jikan.moe/v4";
export const MANGADEX_URL = "https://api.mangadex.org";

export const ImageWithFallback = ({ src, alt, className }) => {
  const [error, setError] = useState(false);
  return <img src={error || !src ? "https://placehold.co/400x600/1e1e1e/FFF?text=No+Cover" : src} alt={alt} className={className} onError={() => setError(true)} loading="lazy" />;
};

export const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000; if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000; if (interval > 1) return Math.floor(interval) + "m ago";
    interval = seconds / 86400; if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600; if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60; if (interval > 1) return Math.floor(interval) + "m ago";
    return "Just now";
};