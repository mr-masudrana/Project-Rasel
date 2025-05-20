// admin - main.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCQd-8YJ2bq19rWQHb5GcHUTY2pYb3ifdo",
  authDomain: "ourschoolapi.firebaseapp.com",
  databaseURL: "https://ourschoolapi-default-rtdb.firebaseio.com",
  projectId: "ourschoolapi",
  storageBucket: "ourschoolapi.appspot.com",
  messagingSenderId: "918668802617",
  appId: "1:918668802617:web:b1f339f1a59a5c92666be8"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const subjectSelect = document.getElementById("subjectSelect");
const datePicker = document.getElementById("datePicker");
const attendanceTable = document.getElementById("attendanceTable");
const downloadCSVBtn = document.getElementById("downloadCSV");
const downloadPDFBtn = document.getElementById("downloadPDF");
const downloadExcelBtn = document.getElementById("downloadExcel");

let currentData = [];

subjectSelect.addEventListener("change", loadAttendance);
datePicker.addEventListener("change", loadAttendance);

function loadAttendance() {
  const subject = subjectSelect.value;
  const date = datePicker.value;
  if (!subject || !date) return;

  const attendanceRef = ref(db, `attendance/${subject}/${date}`);
  get(attendanceRef).then(snapshot => {
    attendanceTable.innerHTML = "";
    currentData = [];

    if (snapshot.exists()) {
      const data = Object.values(snapshot.val());
      data.forEach((entry, index) => {
        const row = `
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
        attendanceTable.innerHTML += row;

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
  });
}

// CSV Download
downloadCSVBtn.addEventListener("click", () => {
  if (currentData.length === 0) {
    alert("No data to download.");
    return;
  }

  const headers = Object.keys(currentData[0]);
  const csvRows = [
    headers.join(","),
    ...currentData.map(row =>
      headers.map(field => `"${row[field] || ''}"`).join(",")
    )
  ];
  const csvData = csvRows.join("\n");
  const blob = new Blob([csvData], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `Attendance_${subjectSelect.value}_${datePicker.value}.csv`;
  link.click();
  URL.revokeObjectURL(url);
});

// PDF Download
downloadPDFBtn.addEventListener("click", () => {
  if (currentData.length === 0) {
    alert("No data to download.");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.text(`Attendance Report - ${subjectSelect.value} - ${datePicker.value}`, 14, 14);
  doc.autoTable({
    head: [["SL", "Name", "Roll", "Batch", "Program", "Email", "Time"]],
    body: currentData.map(row => [
      row.SL, row.Name, row.Roll, row.Batch, row.Program, row.Email, row.Time
    ]),
    startY: 20
  });

  doc.save(`Attendance_${subjectSelect.value}_${datePicker.value}.pdf`);
});

// Excel Download
downloadExcelBtn.addEventListener("click", () => {
  if (currentData.length === 0) {
    alert("No data to download.");
    return;
  }

  const ws = XLSX.utils.json_to_sheet(currentData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Attendance");

  XLSX.writeFile(wb, `Attendance_${subjectSelect.value}_${datePicker.value}.xlsx`);
});
