import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import db from '../db.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-dev';

// Middleware to check if user is admin
const isAdmin = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Get all users
router.get('/users', isAdmin, (req, res) => {
  try {
    const users = db.prepare('SELECT id, firstName, lastName, dob, country, username, role, status FROM users WHERE role != ?').all('admin');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Block/Unblock user
router.post('/users/:id/status', isAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'active' or 'blocked'
    
    if (!['active', 'blocked'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    db.prepare('UPDATE users SET status = ? WHERE id = ?').run(status, id);
    res.json({ message: `User status updated to ${status}` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user status' });
  }
});

// Get user media (for review)
router.get('/users/:id/media', isAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const media = db.prepare('SELECT * FROM media WHERE userId = ?').all(id);
    res.json(media);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user media' });
  }
});

// Reset user password (admin recovery)
router.post('/users/:id/reset-password', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashedPassword, id);
    
    res.json({ message: 'User password reset successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reset user password' });
  }
});

export default router;
