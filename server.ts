import express from "express";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import multer from "multer";
import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import path from "path";
import fs from "fs";

dotenv.config();

// Initialize Firebase Admin
import firebaseConfig from './firebase-applet-config.json' assert { type: 'json' };

const defaultBucketName = `${firebaseConfig.projectId}.appspot.com`;
const configBucketName = firebaseConfig.storageBucket;

try {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      storageBucket: configBucketName || defaultBucketName,
      projectId: firebaseConfig.projectId,
    });
    console.log("Firebase Admin initialized successfully");
  }
} catch (error) {
  console.error("Firebase Admin initialization error:", error);
}

const db = getFirestore(firebaseConfig.firestoreDatabaseId);

let bucket = admin.storage().bucket();
let isCloudStorageAvailable = false;

async function checkStorageAvailability() {
  try {
    const [exists] = await bucket.exists();
    isCloudStorageAvailable = exists;
  } catch (error: any) {
    isCloudStorageAvailable = false;
  }
}
checkStorageAvailability();

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

import cors from "cors";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.post("/api/upload", upload.single('file'), async (req: any, res: any) => {
  try {
    const file = req.file;
    const { userId } = req.body;

    if (!file || !userId) {
      return res.status(400).json({ error: "File and userId are required" });
    }

    const reportId = Math.random().toString(36).substring(2, 15);
    let extension = 'jpg';
    if (file.mimetype === 'application/pdf') {
      extension = 'pdf';
    } else if (file.mimetype.startsWith('image/')) {
      extension = file.mimetype.split('/')[1] || 'jpg';
    }
    
    const fileName = `medical_reports/${userId}/${reportId}.${extension}`;
    let imageUrl = "";

    if (isCloudStorageAvailable) {
      try {
        const blob = bucket.file(fileName);
        const blobStream = blob.createWriteStream({
          metadata: { contentType: file.mimetype },
          resumable: false
        });

        imageUrl = await new Promise<string>((resolve, reject) => {
          blobStream.on('error', (err) => reject(err));
          blobStream.on('finish', () => {
            const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(fileName)}?alt=media`;
            resolve(publicUrl);
          });
          blobStream.end(file.buffer);
        });
      } catch (storageError: any) {
        isCloudStorageAvailable = false;
      }
    }

    if (!imageUrl) {
      const localFileName = `${userId}_${reportId}.${extension}`;
      const localPath = path.join(UPLOADS_DIR, localFileName);
      fs.writeFileSync(localPath, file.buffer);
      const baseUrl = process.env.APP_URL || "";
      imageUrl = `${baseUrl}/uploads/${localFileName}`;
    }

    res.json({ imageUrl, reportId });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to upload file", details: error.message });
  }
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use('/uploads', express.static(UPLOADS_DIR));

app.use("/api/*", (req, res) => {
  res.status(404).json({ error: `API route not found: ${req.originalUrl}` });
});

app.use((err: any, req: any, res: any, next: any) => {
  res.status(err.status || 500).json({ 
    error: "Internal server error", 
    details: err.message 
  });
});

async function setupVite() {
  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
    const distPath = path.join(process.cwd(), "dist");
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get("*", (req, res, next) => {
        if (req.path.startsWith('/api')) return next();
        res.sendFile(path.join(distPath, "index.html"));
      });
    }
  }

  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

setupVite();

export default app;
