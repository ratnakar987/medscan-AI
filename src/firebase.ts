import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../firebase-applet-config.json';

console.log("Initializing Firebase with Project ID:", firebaseConfig.projectId);

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Use initializeFirestore with robust settings for restricted environments
// We force long polling to ensure compatibility with the AI Studio iframe and various proxies
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  experimentalAutoDetectLongPolling: false,
  ignoreUndefinedProperties: true,
  useFetchStreams: false,
  host: 'firestore.googleapis.com',
  ssl: true,
} as any, firebaseConfig.firestoreDatabaseId);

export const storage = getStorage(app);

// Manually set retry times on the storage instance if the functions are not exported
// In some versions of the modular SDK, these might be internal or named differently
try {
  // @ts-ignore - Accessing internal properties as a fallback if setMaxUploadRetryTime is missing
  if (storage && (storage as any)._setMaxUploadRetryTime) {
    (storage as any)._setMaxUploadRetryTime(120000);
  }
} catch (e) {
  console.warn("Could not set custom storage retry times", e);
}

export default app;
