import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getDatabase,
  ref,
  get
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// Firebase config
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
const database = getDatabase(app);

// DOM elements
const loginForm = document.getElementById("loginForm");
const loginBtn = document.getElementById("loginBtn");
const btnText = document.getElementById("btnText");
const spinner = document.getElementById("spinner");
const loginSection = document.getElementById("loginSection");
const logoutBtn = document.getElementById("logout");
const dataSection = document.getElementById("dataSection");
const subjectSelect = document.getElementById("subjectSelect");
const datePicker = document.getElementById("datePicker");
const attendanceTable = document.getElementById("attendanceTable");

let currentData = [];

// Login
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  showLoading();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!email.endsWith(".com")) {
    hideLoading();
    alert("Login restricted to Admin accounts only!");
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);
    hideLoading();
    bootstrap.Modal.getInstance(document.getElementById("loginModal")).hide();
  } catch (error) {
    hideLoading();
    alert("Login failed: " + error.message);
  }
});

// Auth state change
onAuthStateChanged(auth, (user) => {
  if (user && user.email.endsWith(".com")) {
    loginSection.style.display = "none";
    dataSection.style.display = "block";
    logoutBtn.classList.remove("d-none");
  } else {
    loginSection.style.display = "block";
    dataSection.style.display = "none";
    logoutBtn.classList.add("d-none");
  }
});

// Logout
logoutBtn.addEventListener("click", () => {
  signOut(auth).catch((error) => {
    alert("Logout error: " + error.message);
  });
});

// Show loading spinner
function showLoading() {
  spinner.classList.remove("d-none");
  btnText.textContent = "Logging in...";
}

// Hide loading spinner
function hideLoading() {
  spinner.classList.add("d-none");
  btnText.textContent = "Login";
}

// Typed.js Heading Animation
document.addEventListener("DOMContentLoaded", () => {
  new Typed("#typedHeading", {
    strings: ["World University of Bangladesh"],
    typeSpeed: 100,
    backSpeed: 25,
    backDelay: 2000,
    loop: true,
    showCursor: true,
    cursorChar: "|"
  });
});

// Load attendance data
subjectSelect.addEventListener("change", loadAttendance);
datePicker.addEventListener("change", loadAttendance);

function loadAttendance() {
  const subject = subjectSelect.value;
  const date = datePicker.value;
  if (!subject || !date) return;

  const attendanceRef = ref(database, `attendance/${subject}/${date}`);
  get(attendanceRef).then(snapshot => {
    attendanceTable.innerHTML = "";
    currentData = [];

    if (snapshot.exists()) {
      const data = Object.values(snapshot.val());
      data.forEach((entry, index) => {
        attendanceTable.innerHTML += `
          <tr>
            <td>${index + 1}</td>
            <td>${entry.name}</td>
            <td>${entry.roll}</td>
            <td>${entry.batch}</td>
            <td>${entry.program}</td>
            <td>${entry.email}</td>
            <td>${entry.time}</td>
          </tr>
        `;
        currentData.push({
          SL: index + 1,
          Name: entry.name,
          Roll: entry.roll,
          Batch: entry.batch,
          Program: entry.program,
          Email: entry.email,
          Time: entry.time
        });
      });
    } else {
      attendanceTable.innerHTML = `<tr><td colspan="7" class="text-center text-danger">No attendance found.</td></tr>`;
    }
  }).catch(err => {
    console.error(err);
    alert("Error loading attendance data.");
  });
}

// Export PDF
document.getElementById("downloadPDF").addEventListener("click", () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.text("Attendance Data", 14, 16);
  doc.autoTable({
    html: "#attendanceData",
    startY: 20,
    headStyles: { fillColor: [40, 167, 69] },
    theme: "grid"
  });
  doc.save("attendance.pdf");
});

// Export Excel
document.getElementById("downloadExcel").addEventListener("click", () => {
  const table = document.getElementById("attendanceData");
  const wb = XLSX.utils.table_to_book(table, { sheet: "Attendance" });
  XLSX.writeFile(wb, "attendance.xlsx");
});

// Export CSV
document.getElementById("downloadCSV").addEventListener("click", () => {
  const table = document.getElementById("attendanceData");
  const wb = XLSX.utils.table_to_book(table, { sheet: "Attendance" });
  XLSX.writeFile(wb, "attendance.csv");
});
