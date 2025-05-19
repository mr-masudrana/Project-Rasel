import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCQd-8YJ2bq19rWQHb5GcHUTY2pYb3ifdo",
  authDomain: "ourschoolapi.firebaseapp.com",
  databaseURL: "https://ourschoolapi-default-rtdb.firebaseio.com",
  projectId: "ourschoolapi",
  storageBucket: "ourschoolapi.firebasestorage.app",
  messagingSenderId: "918668802617",
  appId: "1:918668802617:web:b1f339f1a59a5c92666be8"
};

// Initialize
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// Login
window.signIn = () => {
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider)
    .catch(error => alert(error.message));
};

// Auth state
onAuthStateChanged(auth, user => {
  if (user && user.email.endsWith("@gmail.com")) {
    document.getElementById("loginSection").style.display = "none";
    document.getElementById("formSection").style.display = "block";
    document.getElementById("userEmail").innerText = user.email;
  } else if (user) {
    alert("Only @student.wub.edu.bd emails are allowed.");
    signOut(auth);
  }
});

// Logout
window.logout = () => signOut(auth);

// Submit attendance
document.getElementById("attendanceForm").addEventListener("submit", e => {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const roll = document.getElementById("roll").value;
  const batch = document.querySelector('input[name="batch"]:checked').value;
  const program = document.querySelector('input[name="program"]:checked').value;
  const email = auth.currentUser.email;
  const uid = auth.currentUser.uid;
  const today = new Date().toISOString().split("T")[0];

  set(ref(db, `attendance/EngineeringDynamics/${today}/${uid}`), {
    name, roll, batch, program, email, time: new Date().toLocaleTimeString()
  }).then(() => {
    document.getElementById("successMsg").style.display = "block";
    document.getElementById("attendanceForm").reset();
    setTimeout(() => document.getElementById("successMsg").style.display = "none", 3000);
  }).catch(err => alert("Error: " + err));
});
