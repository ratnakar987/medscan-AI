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
// We'll try to use the config from the file if available, otherwise environment variables
import firebaseConfig from './firebase-applet-config.json' assert { type: 'json' };

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(), // This works in Cloud Run
    storageBucket: firebaseConfig.storageBucket,
    projectId: firebaseConfig.projectId,
  });
}

const db = getFirestore(firebaseConfig.firestoreDatabaseId);
const bucket = admin.storage().bucket();

// Configure Multer for memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Endpoint to handle file uploads to Cloud Storage
  app.post("/api/upload", upload.single('file'), async (req: any, res: any) => {
    try {
      const file = req.file;
      const { userId } = req.body;

      if (!file || !userId) {
        return res.status(400).json({ error: "File and userId are required" });
      }

      const reportId = Math.random().toString(36).substring(2, 15);
      const extension = file.mimetype === 'application/pdf' ? 'pdf' : 'jpg';
      const fileName = `medical_reports/${userId}/${reportId}.${extension}`;
      
      const blob = bucket.file(fileName);
      const blobStream = blob.createWriteStream({
        metadata: {
          contentType: file.mimetype,
        },
        resumable: false
      });

      const imageUrl = await new Promise<string>((resolve, reject) => {
        blobStream.on('error', (err) => reject(err));
        blobStream.on('finish', () => {
          // Construct the standard Firebase Storage URL
          const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(fileName)}?alt=media`;
          resolve(publicUrl);
        });
        blobStream.end(file.buffer);
      });

      res.json({ imageUrl, reportId });
    } catch (error: any) {
      console.error("Upload Error:", error);
      res.status(500).json({ error: "Failed to upload file", details: error.message });
    }
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile("dist/index.html", { root: "." });
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
