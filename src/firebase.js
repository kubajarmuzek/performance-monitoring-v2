import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";


const firebaseConfig = {
  apiKey: "AIzaSyBbVSiybHh23WCgDCqYBt6SxJMPuUJXYJ4",
  authDomain: "performance-monitoring-bb199.firebaseapp.com",
  databaseURL: "https://performance-monitoring-bb199-default-rtdb.firebaseio.com",
  projectId: "performance-monitoring-bb199",
  storageBucket: "performance-monitoring-bb199.appspot.com",
  messagingSenderId: "881617197814",
  appId: "1:881617197814:web:6f615d6f36c7e11ed6ead7"
};

const firebase = initializeApp(firebaseConfig);
const database = getDatabase(firebase);
const auth = getAuth(firebase);

export { auth, database }; 
export function getCurrentUserUID() {
  const user = auth.currentUser;
  return user ? user.uid : null;
};