// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBXJ_QIK-KHidROQWnE-VXonFPlTxvXJC0",
  authDomain: "snowball-df916.firebaseapp.com",
  projectId: "snowball-df916",
  storageBucket: "snowball-df916.firebasestorage.app",
  messagingSenderId: "258945009793",
  appId: "1:258945009793:web:430df1bc3cf8d92c142580"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;