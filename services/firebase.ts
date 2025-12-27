import { initializeApp } from "firebase/app";

// Firebase configuration
// In a real production environment, these should be environment variables
const firebaseConfig = {
  apiKey: "AIzaSyCqEJ0nTGMsXqR_JnEbudf4piq8Meb_umw",
  authDomain: "la-casa-a7b38.firebaseapp.com",
  projectId: "la-casa-a7b38",
  storageBucket: "la-casa-a7b38.firebasestorage.app",
  messagingSenderId: "282323281436",
  appId: "1:282323281436:web:728d5d101ce771eed761d9"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
