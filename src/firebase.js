import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCO3Vo2RDMaV6bFv3Tqvt7TyKuoPRr75EE",
  authDomain: "ruta-segura-12bec.firebaseapp.com",
  projectId: "ruta-segura-12bec",
  storageBucket: "ruta-segura-12bec.firebasestorage.app",
  messagingSenderId: "522431540231",
  appId: "1:522431540231:web:9cb3391f1338a219ba0ea2"
};

const app = initializeApp(firebaseConfig);

// 🔥 IMPORTANTE
export const db = getFirestore(app);