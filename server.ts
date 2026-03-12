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

// Determine the best bucket name. Default to .appspot.com if the one in config fails or is missing.
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

// Storage state management
let bucket = admin.storage().bucket();
let isCloudStorageAvailable = false;

// Check bucket availability at startup
async function checkStorageAvailability() {
  try {
    const [exists] = await bucket.exists();
    isCloudStorageAvailable = exists;
    if (isCloudStorageAvailable) {
      console.log(`Cloud Storage verified: ${bucket.name}`);
    } else {
      console.warn(`Cloud Storage bucket ${bucket.name} not found. Using local storage fallback.`);
    }
  } catch (error: any) {
    console.warn("Cloud Storage connectivity check failed. Defaulting to local storage fallback.");
    isCloudStorageAvailable = false;
  }
}
checkStorageAvailability();

// Configure Multer for memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Ensure a local uploads directory exists
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Endpoint to handle file uploads
  app.post("/api/upload", upload.single('file'), async (req: any, res: any) => {
    try {
      const file = req.file;
      const { userId } = req.body;

      if (!file || !userId) {
        return res.status(400).json({ error: "File and userId are required" });
      }

      const reportId = Math.random().toString(36).substring(2, 15);
      
      // Get correct extension from mimetype
      let extension = 'jpg';
      if (file.mimetype === 'application/pdf') {
        extension = 'pdf';
      } else if (file.mimetype.startsWith('image/')) {
        extension = file.mimetype.split('/')[1] || 'jpg';
      }
      
      const fileName = `medical_reports/${userId}/${reportId}.${extension}`;
      
      let imageUrl = "";

      // 1. Try Cloud Storage ONLY if it was verified at startup
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
          console.warn("Cloud Storage upload failed unexpectedly:", storageError.message);
          isCloudStorageAvailable = false; // Disable for future attempts
        }
      }

      // 2. Fallback to local storage if Cloud Storage failed or was unavailable
      if (!imageUrl) {
        const localFileName = `${userId}_${reportId}.${extension}`;
        const localPath = path.join(UPLOADS_DIR, localFileName);
        fs.writeFileSync(localPath, file.buffer);
        
        const baseUrl = process.env.APP_URL || "";
        imageUrl = `${baseUrl}/uploads/${localFileName}`;
      }

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

  // Serve local uploads statically
  app.use('/uploads', express.static(UPLOADS_DIR));

  // 404 handler for API routes
  app.use("/api/*", (req, res) => {
    res.status(404).json({ error: `API route not found: ${req.originalUrl}` });
  });

  // Global error handler for JSON responses
  app.use((err: any, req: any, res: any, next: any) => {
    console.error("Server Error:", err);
    res.status(err.status || 500).json({ 
      error: "Internal server error", 
      details: err.message 
    });
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
