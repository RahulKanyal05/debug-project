// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import {getAuth} from 'firebase/auth';
import { getDatabase } from "firebase/database";
import {getFirestore} from 'firebase/firestore';


const firebaseConfig = {
  apiKey: "AIzaSyC-utkGN7LfYA7eMu_sSBAUdJD4otXz_tk",
  authDomain: "prepwise-6014b.firebaseapp.com",
  projectId: "prepwise-6014b",
  storageBucket: "prepwise-6014b.firebasestorage.app",
  messagingSenderId: "110734428949",
  appId: "1:110734428949:web:b763270c97230355e4f71c",
  measurementId: "G-NPB5W7F6YH"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
// const analytics = getAnalytics(app);

// Initialize Firebase
export const auth = getAuth(app);
export const db = getFirestore(app);

export const database = getDatabase(app);