import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAEuLDpruLyfYB1sm9lifPVgP4os6JIvS8",
  authDomain: "ds-learningpath.firebaseapp.com",
  projectId: "ds-learningpath",
  storageBucket: "ds-learningpath.firebasestorage.app",
  messagingSenderId: "495004468399",
  appId: "1:495004468399:web:0c1094d6b2d50d179a405a"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);