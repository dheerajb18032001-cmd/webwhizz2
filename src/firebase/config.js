import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBE5HAG2wM3lwvwrYnLN2QBiQP2Kuc9n98",
  authDomain: "whizz-3fcf2.firebaseapp.com",
  projectId: "whizz-3fcf2",
  storageBucket: "whizz-3fcf2.firebasestorage.app",
  messagingSenderId: "1059784565994",
  appId: "1:1059784565994:web:069d3e8a916f07480ae393",
  measurementId: "G-J4M9HZ66XL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication with persistence
export const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.warn('Could not set auth persistence:', error);
});

// Initialize Cloud Firestore
export const db = getFirestore(app);

// Initialize Cloud Storage
export const storage = getStorage(app);

export default app;
