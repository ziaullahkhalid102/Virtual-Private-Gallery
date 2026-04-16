import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import { initDb } from './server/db.js';
import authRoutes from './server/routes/auth.js';
import galleryRoutes from './server/routes/gallery.js';
import adminRoutes from './server/routes/admin.js';

const PORT = 3000;

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

async function startServer() {
  try {
    const app = express();
    
    app.use(cors());
    app.use(express.json());
    
    // Health check
    app.get('/api/health', (req, res) => {
      res.json({ status: 'ok', message: 'Server is running' });
    });

    // Serve uploaded files statically
    app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

    // Initialize Database
    initDb();

    // API Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/gallery', galleryRoutes);
    app.use('/api/admin', adminRoutes);

    // Vite middleware for development
    if (process.env.NODE_ENV !== 'production') {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } else {
      const distPath = path.join(process.cwd(), 'dist');
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
