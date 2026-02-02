import axios from "axios";

// ✅ ผมใส่ลิงก์ Render ของคุณให้แล้วครับ (มี /api ต่อท้ายถูกต้องแล้ว)
export const API_URL = "https://mangazone-api.onrender.com/api";

export const api = axios.create({
    baseURL: API_URL,
});