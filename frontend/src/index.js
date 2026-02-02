import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // ถ้าคุณไม่มีไฟล์ index.css ให้ลบบรรทัดนี้ทิ้งได้เลย
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);