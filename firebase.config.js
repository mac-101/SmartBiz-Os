// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getAuth} from "firebase/auth";
import {getDatabase} from "firebase/database";

// Your web app's Firebase configuration


const firebaseConfig = {
  apiKey: "AIzaSyASQP-iPlrO2aZ36PKuFQSRAqir8G0juqU",
  authDomain: "smartbiz-os-584a5.firebaseapp.com",
  projectId: "smartbiz-os-584a5",
  storageBucket: "smartbiz-os-584a5.firebasestorage.app",
  messagingSenderId: "467337446606",
  appId: "1:467337446606:web:41f9f0ec7a7270c054bc9f",
  measurementId: "G-6MQDQFQWFY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getDatabase(app);

export {app, analytics, auth, db};