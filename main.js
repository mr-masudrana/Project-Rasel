// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

import {
  getDatabase,
  ref,
  push,
  set
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyCQd-8YJ2bq19rWQHb5GcHUTY2pYb3ifdo",
  authDomain: "ourschoolapi.firebaseapp.com",
  databaseURL: "https://ourschoolapi-default-rtdb.firebaseio.com",
  projectId: "ourschoolapi",
  storageBucket: "ourschoolapi.firebasestorage.app",
  messagingSenderId: "918668802617",
  appId: "1:918668802617:web:b1f339f1a59a5c92666be8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// DOM Elements
const loginSection = document.getElementById("loginSection");
const formSection = document.getElementById("formSection");
const attendanceForm = document.getElementById("attendanceForm");
const userEmailInput = document.getElementById("userEmail");

// Google Sign-In
window.signIn = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    if (!user.email.endsWith(".com")) {
      alert("Please login with your university (.edu) email");
      return;
    }

    userEmailInput.value = user.email;
    loginSection.style.display = "none";
    formSection.style.display = "block";
  } catch (error) {
    console.error("Sign-in error:", error.message);
    alert("Login failed. Try again.");
  }
};

// On Auth State Change
onAuthStateChanged(auth, (user) => {
  if (user && user.email.endsWith(".com")) {
    userEmailInput.value = user.email;
    loginSection.style.display = "none";
    formSection.style.display = "block";
  }
});

// Attendance Submission
attendanceForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const subject = document.getElementById("subject").value;
  const email = userEmailInput.value;
  const name = document.getElementById("name").value.trim();
  const roll = document.getElementById("roll").value.trim();
  const batch = document.querySelector('input[name="batch"]:checked').value;
  const program = document.querySelector('input[name="program"]:checked').value;
  const timestamp = new Date().toISOString();

  if (!subject || !name || !roll) {
    alert("Please fill out all fields");
    return;
  }

  const attendanceRef = ref(db, `attendance/${subject}`);
  const newEntryRef = push(attendanceRef);

  set(newEntryRef, {
    email,
    name,
    roll,
    batch,
    program,
    timestamp
  })
    .then(() => {
      alert("Attendance recorded successfully");
      attendanceForm.reset();
      userEmailInput.value = email; // keep email
    })
    .catch((error) => {
      console.error("Database write failed:", error.message);
      alert("Failed to submit attendance");
    });
});
