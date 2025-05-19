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
  get,
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

// Attendance Submission with Duplicate Prevention
attendanceForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const roll = document.getElementById("roll").value.trim();
  const batch = document.querySelector('input[name="batch"]:checked')?.value;
  const program = document.querySelector('input[name="program"]:checked')?.value;
  const subject = document.getElementById("subject").value;
  const email = auth.currentUser.email;
  const uid = auth.currentUser.uid;

  if (!subject) {
    alert("Please select a subject.");
    return;
  }

  if (!name || !roll || !batch || !program) {
    alert("Please fill in all required fields.");
    return;
  }

  const now = new Date();
  const bstOffset = 6 * 60; // +6 hours in minutes
  const localTime = new Date(now.getTime() + bstOffset * 60000);
  const today = localTime.toISOString().split("T")[0];
  const time = localTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const attendanceRef = ref(db, `attendance/${subject}/${today}/${uid}`);

  try {
    const snapshot = await get(attendanceRef);

    if (snapshot.exists()) {
      alert("You have already submitted attendance for today.");
      return;
    }

    await set(attendanceRef, {
      name,
      roll,
      batch,
      program,
      email,
      timestamp: now.toISOString(),
      time
    });

    attendanceForm.reset();
    userEmailInput.value = email;
    document.getElementById("successMsg").style.display = "block";
    setTimeout(() => {
      document.getElementById("successMsg").style.display = "none";
    }, 5000);

  } catch (error) {
    console.error("Error:", error);
    alert("Failed to submit attendance. Please try again.");
  }
});
