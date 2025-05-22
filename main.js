// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut
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
  storageBucket: "ourschoolapi.appspot.com",
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
const logoutBtn = document.getElementById("logout");
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
      await signOut(auth);
      return;
    }

    userEmailInput.value = user.email;
    loginSection.style.display = "none";
    formSection.style.display = "block";
    logoutBtn.classList.remove("d-none");
  } catch (error) {
    console.error("Sign-in error:", error.message);
    alert("Login failed. Try again.");
  }
};

// Logout
window.logout = () => {
  signOut(auth).then(() => {
    formSection.style.display = "none";
    loginSection.style.display = "block";
    logoutBtn.classList.add("d-none");
    userEmailInput.value = "";
  });
};

// On Auth State Changed
onAuthStateChanged(auth, (user) => {
  if (user && user.email.endsWith(".com")) {
    userEmailInput.value = user.email;
    loginSection.style.display = "none";
    formSection.style.display = "block";
    logoutBtn.classList.remove("d-none");
  }
});

// Attendance Form Submission
attendanceForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const roll = document.getElementById("roll").value.trim();
  const batch = document.querySelector('input[name="batch"]:checked')?.value;
  const program = document.querySelector('input[name="program"]:checked')?.value;
  const subject = document.getElementById("subject").value;
  const email = auth.currentUser.email;
  const uid = auth.currentUser.uid;

  if (!subject || !name || !roll || !batch || !program) {
    alert("Please fill in all required fields.");
    return;
  }

  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const time = now.toLocaleTimeString();
  const attendanceRef = ref(db, `attendance/${subject}/${today}/${uid}`);

  try {
    const snapshot = await get(attendanceRef);
    if (snapshot.exists()) {
      alert("You have already submitted attendance for today.");
      return;
    }

    await set(attendanceRef, {
      name, roll, batch, program, email, timestamp: now.toISOString(), time
    });

    // Show Modal with summary
    document.getElementById("summaryName").textContent = name;
    document.getElementById("summaryRoll").textContent = roll;
    document.getElementById("summaryBatch").textContent = batch;
    document.getElementById("summaryProgram").textContent = program;
    document.getElementById("summarySubject").textContent = subject;
    document.getElementById("summaryEmail").textContent = email;
    document.getElementById("summaryTime").textContent = time;

    attendanceForm.reset();
    userEmailInput.value = email;

    new bootstrap.Modal(document.getElementById("summaryModal")).show();
  } catch (error) {
    console.error("Error submitting attendance:", error);
    alert("Failed to submit attendance. Please try again.");
  }
});
