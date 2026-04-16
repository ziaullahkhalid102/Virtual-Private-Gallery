import express from 'express';
import multer from 'multer';
import jwt from 'jsonwebtoken';
import path from 'path';
import db from '../db.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-dev';

// Middleware to authenticate JWT
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/webm', 'audio/mpeg', 'audio/wav'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Upload media
router.post('/upload', authenticateToken, upload.single('file'), (req: any, res: any) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded or invalid file type' });
    }

    const { filename, originalname, mimetype, size } = req.file;
    const userId = req.user.userId;

    const stmt = db.prepare(`
      INSERT INTO media (userId, filename, originalName, mimetype, size)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(userId, filename, originalname, mimetype, size);

    res.status(201).json({ 
      message: 'File uploaded successfully', 
      media: {
        id: result.lastInsertRowid,
        filename,
        originalName: originalname,
        mimetype,
        size
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's media
router.get('/', authenticateToken, (req: any, res: any) => {
  try {
    const userId = req.user.userId;
    const media = db.prepare('SELECT * FROM media WHERE userId = ? ORDER BY uploadDate DESC').all(userId);
    res.json(media);
  } catch (error) {
    console.error('Fetch media error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete media
router.delete('/:id', authenticateToken, (req: any, res: any) => {
  try {
    const userId = req.user.userId;
    const mediaId = req.params.id;

    const media = db.prepare('SELECT * FROM media WHERE id = ? AND userId = ?').get(mediaId, userId) as any;
    
    if (!media) {
      return res.status(404).json({ error: 'Media not found or unauthorized' });
    }

    // Delete file from filesystem
    const fs = require('fs');
    const filePath = path.join(process.cwd(), 'uploads', media.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete from database
    db.prepare('DELETE FROM media WHERE id = ?').run(mediaId);

    res.json({ message: 'Media deleted successfully' });
  } catch (error) {
    console.error('Delete media error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
