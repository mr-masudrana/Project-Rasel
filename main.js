import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCQd-8YJ2bq19rWQHb5GcHUTY2pYb3ifdo",
  authDomain: "ourschoolapi.firebaseapp.com",
  databaseURL: "https://ourschoolapi-default-rtdb.firebaseio.com",
  projectId: "ourschoolapi",
  storageBucket: "ourschoolapi.firebasestorage.app",
  messagingSenderId: "918668802617",
  appId: "1:918668802617:web:b1f339f1a59a5c92666be8"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const form = document.getElementById("attendanceForm");
const statusMsg = document.getElementById("statusMsg");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const roll = document.getElementById("roll").value.trim();
  const batch = document.getElementById("batch").value.trim();
  const program = document.getElementById("program").value.trim();
  const subject = document.getElementById("subject").value;

  if (!subject) {
    statusMsg.innerText = "Please select a subject.";
    return;
  }

  const today = new Date();
  const dateStr = today.toISOString().split("T")[0]; // yyyy-mm-dd
  const timeStr = today.toLocaleTimeString();

  const uid = email.replace(/[.@]/g, "_");
  const attendanceRef = ref(db, `attendance/${subject}/${dateStr}/${uid}`);

  // First check if attendance already exists
  const snapshot = await get(attendanceRef);

  if (snapshot.exists()) {
    statusMsg.innerText = "You have already submitted attendance for today.";
    return;
  }

  const data = {
    name,
    email,
    roll,
    batch,
    program,
    time: timeStr
  };

  set(attendanceRef, data)
    .then(() => {
      statusMsg.innerText = "Attendance submitted successfully!";
      form.reset();
    })
    .catch((error) => {
      statusMsg.innerText = "Error: " + error.message;
    });
});
