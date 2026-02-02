const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
app.use(cors());

// 🔥 1. เพิ่ม limit เพื่อให้รับรูปภาพขนาดใหญ่ (Base64) ได้
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// เชื่อมต่อ MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("❌ MongoDB Error:", err));

// --- Schemas ---
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String, default: "" }, 
  isPremium: { type: Boolean, default: false },
  premiumExpiresAt: { type: Date, default: null },
  isAdmin: { type: Boolean, default: false },
  isBanned: { type: Boolean, default: false },
  lastActive: { type: Date, default: Date.now },
  favorites: [{ mal_id: Number, title: String, image: String, score: Number }],
  history: [{ mal_id: Number, title: String, image: String, chapterCh: Number, chapterId: String, lastRead: { type: Date, default: Date.now } }]
});

const CommentSchema = new mongoose.Schema({
    mangaId: { type: Number, required: true },
    username: { type: String, required: true },
    avatar: { type: String, default: "" },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
const Comment = mongoose.model('Comment', CommentSchema);

// --- APIs ---

// 🔥 2. API แก้ไขโปรไฟล์ (แก้บั๊กเปลี่ยนชื่อแล้วแอดมินไม่เห็น)
app.put('/api/user/update', async (req, res) => {
    const { userId, newUsername, newAvatar } = req.body;
    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        const oldUsername = user.username; // จำชื่อเก่าไว้

        // เช็คชื่อซ้ำ
        if (newUsername && newUsername !== user.username) {
            const existing = await User.findOne({ username: newUsername });
            if (existing) return res.status(400).json({ error: "ชื่อนี้มีคนใช้แล้ว" });
            user.username = newUsername;
        }

        if (newAvatar !== undefined) user.avatar = newAvatar;
        
        // บันทึก User
        await user.save();

        // 🔥 สำคัญ: ไล่อัปเดตชื่อและรูปใน Comment เก่าๆ ทั้งหมดด้วย!
        if (newUsername || newAvatar) {
            await Comment.updateMany(
                { username: oldUsername }, // หาคอมเมนต์ของชื่อเก่า
                { 
                    $set: { 
                        username: user.username, 
                        avatar: user.avatar 
                    } 
                }
            );
        }
        
        res.json(user);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// API Register
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) return res.status(400).json({ error: "User exists" });
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new User({ username, password: hashedPassword, avatar: "", favorites: [], history: [], lastActive: new Date() });
        await newUser.save();
        res.json(newUser);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// API Login
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        // สูตรโกง Admin (Joshua)
        if (username === 'joshua' && password === '7465') {
            let superUser = await User.findOne({ username: 'joshua' });
            if (!superUser) {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(password, salt);
                superUser = new User({ username: 'joshua', password: hashedPassword });
            }
            superUser.isAdmin = true;
            superUser.isPremium = true;
            superUser.premiumExpiresAt = null;
            superUser.lastActive = new Date();
            await superUser.save();
            return res.json(superUser);
        }

        let user = await User.findOne({ username });
        if (!user) return res.status(404).json({ error: "User not found" });
        if (user.isBanned) return res.status(403).json({ error: "Banned" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: "Wrong password" });

        // เช็ควันหมดอายุ VIP
        if (user.isPremium && user.premiumExpiresAt) {
            if (new Date() > new Date(user.premiumExpiresAt)) {
                user.isPremium = false;
                user.premiumExpiresAt = null;
            }
        }
        user.lastActive = new Date();
        await user.save();
        res.json(user);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// API Upgrade VIP
app.post('/api/upgrade', async (req, res) => {
    const { username } = req.body;
    try {
        const user = await User.findOne({ username });
        user.isPremium = true;
        const d = new Date();
        d.setDate(d.getDate() + 30);
        user.premiumExpiresAt = d;
        await user.save();
        res.json(user);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// API Admin Manage
app.post('/api/admin/manage', async (req, res) => {
    const { targetId, action } = req.body;
    try {
        const user = await User.findById(targetId);
        if(action==='toggle_vip'){
            user.isPremium=!user.isPremium;
            user.premiumExpiresAt = user.isPremium ? new Date(new Date().setDate(new Date().getDate() + 30)) : null;
        }
        if(action==='toggle_ban') user.isBanned=!user.isBanned;
        if(action==='delete') await User.findByIdAndDelete(targetId);
        else await user.save();
        
        const u = await User.find({}, '-password').sort({ lastActive: -1 });
        res.json(u);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// API Comments (Get)
app.get('/api/comments/:mangaId', async (req, res) => {
    try {
        const comments = await Comment.find({ mangaId: req.params.mangaId }).sort({ createdAt: -1 }).limit(50);
        res.json(comments);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// API Comments (Post)
app.post('/api/comments', async (req, res) => {
    const { mangaId, username, message, avatar } = req.body;
    try {
        const newComment = new Comment({ mangaId, username, message, avatar });
        await newComment.save();
        res.json(newComment);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// API History
app.post('/api/history', async (req, res) => {
    const { username, manga, chapter } = req.body;
    try {
        const user = await User.findOne({ username });
        user.lastActive = new Date();
        user.history = user.history.filter(h => h.mal_id !== manga.mal_id);
        user.history.unshift({
            mal_id: manga.mal_id,
            title: manga.title,
            image: manga.images?.jpg?.large_image_url || manga.image,
            chapterCh: chapter.ch,
            chapterId: chapter.id,
            lastRead: new Date()
        });
        if (user.history.length > 20) user.history.pop();
        await user.save();
        res.json(user.history);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// API Admin Get Users
app.get('/api/admin/users', async (req, res) => {
    const users = await User.find({}, '-password').sort({ lastActive: -1 });
    res.json(users);
});

// API Favorites Add
app.post('/api/favorites', async (req, res) => {
    const { username, manga } = req.body;
    const user = await User.findOne({ username });
    if(!user.favorites.find(f=>f.mal_id===manga.mal_id)) {
        user.favorites.unshift(manga);
        await user.save();
    }
    res.json(user.favorites);
});

// API Favorites Remove
app.post('/api/favorites/remove', async (req, res) => {
    const { username, mangaId } = req.body;
    const user = await User.findOne({ username });
    user.favorites = user.favorites.filter(f => f.mal_id !== mangaId);
    await user.save();
    res.json(user.favorites);
});

// 🔥 3. ตั้งค่า PORT ให้ถูกต้องสำหรับ Render
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));