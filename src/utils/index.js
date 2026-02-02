import axios from "axios";

// ✅ ลิงก์ Server ของคุณบน Render
export const API_URL = "https://mangazone-api.onrender.com/api";
export const api = axios.create({ baseURL: API_URL });

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