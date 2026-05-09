import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: "AIzaSyBIR7xxSTUXiePXMIgWyksZmEjkUPReN0A",
  authDomain: "encurtador-senai-tds26.firebaseapp.com",
  projectId: "encurtador-senai-tds26",
  storageBucket: "encurtador-senai-tds26.firebasestorage.app",
  messagingSenderId: "1022128347643",
  appId: "1:1022128347643:web:2cd4f533458b2a89a9135e"
};

export const app = initializeApp(firebaseConfig);
