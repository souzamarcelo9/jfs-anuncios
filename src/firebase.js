import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import { getStorage } from "firebase/storage";

import {
  getFirestore,
  query,
  getDocs,
  collection,
  where,
  addDoc,
 } from "firebase/firestore";

const app = firebase.initializeApp({
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
});

const storage = getStorage(app);
const db = getFirestore(app);
export const auth = app.auth();
export {  
  db,  
  storage
};

export default app;

// Import the functions you need from the SDKs you need
/* import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC9LyYlvES7wTF2ZRXYSq7TuRhJSJR-EoQ",
  authDomain: "jf-anuncios.firebaseapp.com",
  projectId: "jf-anuncios",
  storageBucket: "jf-anuncios.firebasestorage.app",
  messagingSenderId: "710937636055",
  appId: "1:710937636055:web:ed761e28a391ffa0e81492",
  measurementId: "G-DS002JSZKG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app); */