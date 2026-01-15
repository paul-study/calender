// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA2znCvQyRSWZ7StZisAkNMCRs0P6q2py8",
    authDomain: "beauteehful.firebaseapp.com",
    projectId: "beauteehful",
    storageBucket: "beauteehful.firebasestorage.app",
    messagingSenderId: "405388835754",
    appId: "1:405388835754:web:5a7165071585f24db509d3",
    measurementId: "G-EQH8XV5LCN"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firestore database
const db = firebase.firestore();

// Initialize Auth (for manager login later)
const auth = firebase.auth();

console.log("Firebase initialized successfully!");
