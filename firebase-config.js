// firebase-config.js
// TODO: Replace with your actual Firebase project config
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDBiOXX9HlFnON-9fKvVBgFEqsi5VY-wms",
  authDomain: "message-testing-d5acb.firebaseapp.com",
  projectId: "message-testing-d5acb",
  storageBucket: "message-testing-d5acb.firebasestorage.app",
  messagingSenderId: "916115288918",
  appId: "1:916115288918:web:1fcd1c85d6d803e6651cf7",
  measurementId: "G-PKDG44L20L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export const ROLE_ACCESS_LIST = {
  "immersionlabsindia@gmail.com": "admin",
  "gauravroy476@gmail.com": "teacher",
  "thorroy888@gmail.com": "student",
  "sauravroy469@gmail.com": "student"
};

export const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        
        // Look up the role in the access list
        let role = ROLE_ACCESS_LIST[user.email];
        
        if (!role) {
            alert(`Your email (${user.email}) is not on the Role Access List!\n\nFor testing purposes, you will be defaulted to the Student portal. To change this, edit 'firebase-config.js' in the Landing Page folder.`);
            role = 'student'; // Fallback so you aren't completely locked out while testing
        }

        // Save or update user role in Firestore
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
            await setDoc(userRef, {
                uid: user.uid,
                email: user.email,
                name: user.displayName,
                role: role,
                createdAt: new Date().toISOString()
            });
        } else {
            // Update role in DB if it changed in the access list
            await setDoc(userRef, { role: role }, { merge: true });
        }
        
        // Store user info locally to know who is logged in
        const userData = {
            uid: user.uid,
            email: user.email,
            role: role,
            name: user.displayName
        };
        localStorage.setItem('edtech_user', JSON.stringify(userData));
        
        alert(`Successfully logged in as ${role}!\nRedirecting to ${role} portal...`);
        
        // Pass the auth context via URL params since localhost ports have isolated storage
        const userParam = encodeURIComponent(JSON.stringify(userData));
        
        const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const basePath = isLocal ? '' : '/Working-Platform';

        if (role === 'admin') {
            window.location.href = isLocal ? 'http://localhost:5175/?user=' + userParam : basePath + '/admin/?user=' + userParam; 
        } else if (role === 'student') {
            window.location.href = isLocal ? 'http://localhost:5173/?user=' + userParam : basePath + '/student/?user=' + userParam; 
        } else if (role === 'teacher') {
            window.location.href = isLocal ? 'http://localhost:5174/?user=' + userParam : basePath + '/teacher/?user=' + userParam; 
        }
        
    } catch (error) {
        console.error("Error during sign in:", error);
        alert("Login failed: " + error.message);
    }
};
