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

document.getElementById("datePicker").addEventListener("change", function () {
  const selectedDate = this.value;
  if (!selectedDate) return;

  const attendanceRef = ref(db, `attendance/EngineeringDynamics/${selectedDate}`);
  get(attendanceRef).then(snapshot => {
    const table = document.getElementById("attendanceTable");
    table.innerHTML = "";

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
        table.innerHTML += row;
      });
    } else {
      table.innerHTML = `<tr><td colspan="6" class="text-center">No attendance found for this date.</td></tr>`;
    }
  }).catch(err => alert("Error fetching data: " + err));
});
