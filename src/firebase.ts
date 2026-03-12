import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Use initializeFirestore with robust settings for restricted environments
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  experimentalAutoDetectLongPolling: false, // Force it
}, firebaseConfig.firestoreDatabaseId);

export const storage = getStorage(app);

// Connection test with a longer timeout or retry logic
async function testConnection() {
  try {
    // Try to get a document from the server to verify connection
    // We use a non-existent doc just to check connectivity
    await getDocFromServer(doc(db, '_connection_test_', 'ping'));
    console.log("Firestore connection verified.");
  } catch (error: any) {
    if (error?.message?.includes('the client is offline') || error?.code === 'unavailable') {
      console.warn("Firestore is currently offline or unreachable. This may be due to network restrictions in the preview environment.");
      console.warn("Retrying connection in 5 seconds...");
      setTimeout(testConnection, 5000);
    } else {
      // Other errors (like permission denied) actually mean we ARE connected
      console.log("Firestore connection check completed (Response received).");
    }
  }
}
testConnection();

export default app;
