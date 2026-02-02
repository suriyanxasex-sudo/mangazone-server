const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();

// ✅ CORS สำหรับ Production
const allowedOrigins = [
  'https://mangazone.vercel.app',    // Frontend ของคุณ
  'https://mangazone.netlify.app',   // หรือ Netlify
  'http://localhost:3000',           // Development
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `CORS policy: Origin ${origin} not allowed`;
      console.warn(msg);
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
.then(() => console.log("✅ Connected to MongoDB Atlas"))
.catch(err => {
  console.error("❌ MongoDB Connection Error:", err);
  process.exit(1);
});

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
  favorites: [{
    mangaId: { type: String, required: true },
    title: String,
    image: String,
    score: Number
  }],
  history: [{
    mangaId: { type: String, required: true },
    title: String,
    image: String,
    chapterCh: Number,
    chapterId: String,
    lastRead: { type: Date, default: Date.now }
  }]
});

const CommentSchema = new mongoose.Schema({
  mangaId: { type: String, required: true },
  username: { type: String, required: true },
  avatar: { type: String, default: "" },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
const Comment = mongoose.model('Comment', CommentSchema);

// ✅ Middleware: Log requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// ✅ Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'MangaZone API',
    timestamp: new Date(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    uptime: process.uptime()
  });
});

// ✅ API Info
app.get('/', (req, res) => {
  res.json({
    service: 'MangaZone API Server',
    version: '2.0.0',
    status: 'running',
    endpoints: [
      'GET  /api/health',
      'POST /api/register',
      'POST /api/login',
      'PUT  /api/user/update',
      'GET  /api/user/:username',
      'POST /api/upgrade',
      'GET  /api/admin/users',
      'POST /api/admin/manage',
      'GET  /api/comments/:mangaId',
      'POST /api/comments',
      'POST /api/favorites/add',
      'POST /api/favorites/remove',
      'POST /api/history/add'
    ]
  });
});

// ✅ API Register
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: "ต้องกรอกชื่อผู้ใช้และรหัสผ่าน" });
    }
    
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "มีผู้ใช้ชื่อนี้แล้ว" });
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const newUser = new User({
      username,
      password: hashedPassword,
      avatar: "",
      favorites: [],
      history: [],
      lastActive: new Date()
    });
    
    await newUser.save();
    
    const userResponse = newUser.toObject();
    delete userResponse.password;
    
    res.status(201).json(userResponse);
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ API Login
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: "ต้องกรอกชื่อผู้ใช้และรหัสผ่าน" });
    }
    
    // Super Admin (Joshua)
    if (username.toLowerCase() === 'joshua' && password === '7465') {
      let superUser = await User.findOne({ username: 'joshua' });
      
      if (!superUser) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('7465', salt);
        superUser = new User({
          username: 'joshua',
          password: hashedPassword,
          isAdmin: true,
          isPremium: true,
          premiumExpiresAt: null
        });
      } else {
        superUser.isAdmin = true;
        superUser.isPremium = true;
        superUser.premiumExpiresAt = null;
      }
      
      superUser.lastActive = new Date();
      await superUser.save();
      
      const userResponse = superUser.toObject();
      delete userResponse.password;
      
      return res.json(userResponse);
    }
    
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: "ไม่พบผู้ใช้" });
    }
    
    if (user.isBanned) {
      return res.status(403).json({ error: "บัญชีนี้ถูกระงับการใช้งาน" });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "รหัสผ่านไม่ถูกต้อง" });
    }
    
    // เช็ควันหมดอายุ VIP
    if (user.isPremium && user.premiumExpiresAt) {
      if (new Date() > new Date(user.premiumExpiresAt)) {
        user.isPremium = false;
        user.premiumExpiresAt = null;
      }
    }
    
    user.lastActive = new Date();
    await user.save();
    
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.json(userResponse);
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ API Update Profile
app.put('/api/user/update', async (req, res) => {
  try {
    const { userId, newUsername, newAvatar } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: "ต้องระบุ userId" });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "ไม่พบผู้ใช้" });
    }
    
    const oldUsername = user.username;
    
    if (newUsername && newUsername !== user.username) {
      const existing = await User.findOne({ username: newUsername });
      if (existing) {
        return res.status(400).json({ error: "ชื่อนี้มีคนใช้แล้ว" });
      }
      user.username = newUsername;
    }
    
    if (newAvatar !== undefined) {
      user.avatar = newAvatar;
    }
    
    await user.save();
    
    // อัปเดตคอมเมนต์เก่า
    if (newUsername || newAvatar) {
      await Comment.updateMany(
        { username: oldUsername },
        {
          $set: {
            username: user.username,
            avatar: user.avatar
          }
        }
      );
    }
    
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.json(userResponse);
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ API Get User Profile
app.get('/api/user/:username', async (req, res) => {
  try {
    const user = await User.findOne(
      { username: req.params.username },
      '-password'
    );
    
    if (!user) {
      return res.status(404).json({ error: "ไม่พบผู้ใช้" });
    }
    
    res.json(user);
  } catch (err) {
    console.error("Get user error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ API Upgrade to VIP
app.post('/api/upgrade', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: "ต้องระบุ userId" });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "ไม่พบผู้ใช้" });
    }
    
    user.isPremium = true;
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);
    user.premiumExpiresAt = expiryDate;
    
    await user.save();
    
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.json(userResponse);
  } catch (err) {
    console.error("Upgrade error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ API Admin: Get All Users
app.get('/api/admin/users', async (req, res) => {
  try {
    const users = await User.find({}, '-password').sort({ lastActive: -1 });
    res.json(users);
  } catch (err) {
    console.error("Get users error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ API Admin: Manage User
app.post('/api/admin/manage', async (req, res) => {
  try {
    const { targetId, action } = req.body;
    
    if (!targetId || !action) {
      return res.status(400).json({ error: "ต้องระบุ targetId และ action" });
    }
    
    if (action === 'delete') {
      await User.findByIdAndDelete(targetId);
    } else {
      const user = await User.findById(targetId);
      if (!user) {
        return res.status(404).json({ error: "ไม่พบผู้ใช้" });
      }
      
      if (action === 'toggle_vip') {
        user.isPremium = !user.isPremium;
        user.premiumExpiresAt = user.isPremium ? 
          new Date(new Date().setDate(new Date().getDate() + 30)) : null;
      } else if (action === 'toggle_ban') {
        user.isBanned = !user.isBanned;
      } else {
        return res.status(400).json({ error: "action ไม่ถูกต้อง" });
      }
      
      await user.save();
    }
    
    const users = await User.find({}, '-password').sort({ lastActive: -1 });
    res.json(users);
  } catch (err) {
    console.error("Admin manage error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ API Comments: Get
app.get('/api/comments/:mangaId', async (req, res) => {
  try {
    const comments = await Comment.find({ mangaId: req.params.mangaId })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(comments);
  } catch (err) {
    console.error("Get comments error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ API Comments: Post
app.post('/api/comments', async (req, res) => {
  try {
    const { mangaId, username, message, avatar } = req.body;
    
    if (!mangaId || !username || !message) {
      return res.status(400).json({ error: "ต้องระบุ mangaId, username และ message" });
    }
    
    const newComment = new Comment({
      mangaId,
      username,
      message,
      avatar: avatar || ""
    });
    
    await newComment.save();
    res.status(201).json(newComment);
  } catch (err) {
    console.error("Post comment error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ API Favorites: Add
app.post('/api/favorites/add', async (req, res) => {
  try {
    const { userId, manga } = req.body;
    
    if (!userId || !manga) {
      return res.status(400).json({ error: "ต้องระบุ userId และ manga" });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "ไม่พบผู้ใช้" });
    }
    
    const mangaId = manga.mangaId || manga.id;
    const exists = user.favorites.find(f => f.mangaId === mangaId);
    
    if (!exists) {
      user.favorites.unshift({
        mangaId: mangaId,
        title: manga.title,
        image: manga.image || manga.cover,
        score: manga.score || 0
      });
      
      await user.save();
    }
    
    res.json(user.favorites);
  } catch (err) {
    console.error("Add favorite error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ API Favorites: Remove
app.post('/api/favorites/remove', async (req, res) => {
  try {
    const { userId, mangaId } = req.body;
    
    if (!userId || !mangaId) {
      return res.status(400).json({ error: "ต้องระบุ userId และ mangaId" });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "ไม่พบผู้ใช้" });
    }
    
    user.favorites = user.favorites.filter(f => f.mangaId !== mangaId);
    await user.save();
    
    res.json(user.favorites);
  } catch (err) {
    console.error("Remove favorite error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ API History: Add
app.post('/api/history/add', async (req, res) => {
  try {
    const { userId, manga, chapter } = req.body;
    
    if (!userId || !manga) {
      return res.status(400).json({ error: "ต้องระบุ userId และ manga" });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "ไม่พบผู้ใช้" });
    }
    
    user.lastActive = new Date();
    
    const mangaId = manga.mangaId || manga.id;
    user.history = user.history.filter(h => h.mangaId !== mangaId);
    
    user.history.unshift({
      mangaId: mangaId,
      title: manga.title,
      image: manga.image || manga.cover,
      chapterCh: chapter?.ch || 0,
      chapterId: chapter?.id || chapter?.chapterId || "0",
      lastRead: new Date()
    });
    
    if (user.history.length > 20) {
      user.history.pop();
    }
    
    await user.save();
    res.json(user.history);
  } catch (err) {
    console.error("Add history error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ 404 Handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: "API endpoint not found" });
});

// ✅ Global Error Handler
app.use((err, req, res, next) => {
  console.error("Global error:", err.stack);
  res.status(500).json({ 
    error: "Internal server error",
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ✅ Start Server
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 MangaZone API Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️  MongoDB: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
});