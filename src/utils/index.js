import axios from "axios";

// ✅ ต้องใช้ลิงก์ Render (Backend) ตรงนี้เท่านั้น ห้ามใช้ลิงก์ Vercel
// เพื่อให้หน้าเว็บ (Face) วิ่งไปคุยกับสมอง (Brain) ได้ถูกที่ครับ
export const API_URL = "https://mangazone-api.onrender.com/api";

export const api = axios.create({
    baseURL: API_URL,
});