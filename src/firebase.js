import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBpZeoVQUSV1ki5DFuWDNnrcnI9KVEJpbo",
  authDomain: "biblioteka-f0642.firebaseapp.com",
  projectId: "biblioteka-f0642",
  storageBucket: "biblioteka-f0642.firebasestorage.app",
  messagingSenderId: "209380759375",
  appId: "1:209380759375:web:0d74addf05c560b942973a",
  measurementId: "G-815RKJ14YR"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
