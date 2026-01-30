// firebase/client.ts

import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAoDNvPavELYb_6Gylx12A7Cf75G9Z2nWM",
  authDomain: "my-project-id-5b000.firebaseapp.com",
  projectId: "my-project-id-5b000",
  storageBucket: "my-project-id-5b000.firebasestorage.app",
  messagingSenderId: "213354384953",
  appId: "1:213354384953:web:be29a77b2105211d0887e8",
  measurementId: "G-RFR65GCLTS"
};

// Initialize Firebase app (prevent re-init in Next.js)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// REQUIRED exports (used across the app)
export const auth = getAuth(app);
export const db = getFirestore(app);

// (Optional) analytics — REMOVE for now
// Analytics causes SSR issues in Next.js if misused

// const firebaseConfig = {
//   apiKey: "AIzaSyAoDNvPavELYb_6Gylx12A7Cf75G9Z2nWM",
//   authDomain: "my-project-id-5b000.firebaseapp.com",
//   projectId: "my-project-id-5b000",
//   storageBucket: "my-project-id-5b000.firebasestorage.app",
//   messagingSenderId: "213354384953",
//   appId: "1:213354384953:web:be29a77b2105211d0887e8",
//   measurementId: "G-RFR65GCLTS"
// };