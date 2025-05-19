import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

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

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const subjectSelect = document.getElementById("subjectSelect");
const datePicker = document.getElementById("datePicker");
const attendanceTable = document.getElementById("attendanceTable");

// Load attendance when subject or date changes
subjectSelect.addEventListener("change", loadAttendance);
datePicker.addEventListener("change", loadAttendance);

function loadAttendance() {
  const subject = subjectSelect.value;
  const date = datePicker.value;

  if (!subject || !date) return;

  const attendanceRef = ref(db, `attendance/${subject}/${date}`);
  get(attendanceRef).then(snapshot => {
    attendanceTable.innerHTML = "";

    if (snapshot.exists()) {
      const data = snapshot.val();
      Object.values(data).forEach(entry => {
        const row = `
          <tr>
            <td>${entry.name}</td>
            <td>${entry.roll}</td>
            <td>${entry.batch}</td>
            <td>${entry.program}</td>
            <td>${entry.email}</td>
            <td>${entry.time}</td>
          </tr>
        `;
        attendanceTable.innerHTML += row;
      });
    } else {
      attendanceTable.innerHTML = `<tr><td colspan="6" class="text-center">No attendance found.</td></tr>`;
    }
  }).catch(err => {
    alert("Error: " + err.message);
  });
}
