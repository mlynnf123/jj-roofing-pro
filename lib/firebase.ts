import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration should be stored in environment variables
// for security and flexibility.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase safely for both server and client-side rendering.
// This prevents re-initializing the app on every hot-reload in development.
console.log("Firebase config:", {
  projectId: firebaseConfig.projectId,
  hasApiKey: !!firebaseConfig.apiKey,
  authDomain: firebaseConfig.authDomain
});

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

console.log("Firebase initialized successfully");

export { db };
