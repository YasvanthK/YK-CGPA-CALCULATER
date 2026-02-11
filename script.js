const table = document.getElementById("subjectTable");
const prevCgpaInput = document.getElementById("prevCgpa");
const prevCreditsInput = document.getElementById("prevCredits");

// Add initial row
addRow();

function addRow() {
  const row = document.createElement("tr");
  row.innerHTML = `
    <td><input type="text" placeholder="Subject"></td>
    <td><input type="number" min="1" placeholder="Credits"></td>
    <td>
      <select>
        <option value="">Grade</option>
        <option value="10">O</option>
        <option value="9">A+</option>
        <option value="8">A</option>
        <option value="7">B+</option>
        <option value="6">B</option>
        <option value="5">C</option>
        <option value="0">U</option>
      </select>
    </td>`;
  table.appendChild(row);
}

function togglePrevious() {
  document.getElementById("previousInputs").classList.toggle("hidden");
}

function calculate() {
  let totalCredits = 0;
  let totalPoints = 0;

  [...table.rows].forEach(row => {
    const credits = Number(row.cells[1].querySelector("input").value);
    const grade = Number(row.cells[2].querySelector("select").value);
    if (credits && grade) {
      totalCredits += credits;
      totalPoints += credits * grade;
    }
  });

  if (!totalCredits) return alert("Enter valid data!");

  let sgpa = (totalPoints / totalCredits).toFixed(2);
  let cgpa = sgpa;

  if (document.getElementById("prevToggle").checked) {
    const prevCredits = Number(prevCreditsInput.value);
    const prevCgpa = Number(prevCgpaInput.value);
    if (prevCredits && prevCgpa) {
      cgpa = ((totalPoints + prevCgpa * prevCredits) / (totalCredits + prevCredits)).toFixed(2);
    }
  }

  document.getElementById("sgpa").innerText = `SGPA: ${sgpa}`;
  document.getElementById("cgpa").innerText = `CGPA: ${cgpa}`;
  document.getElementById("totalCredits").innerText = `Total Credits: ${totalCredits}`;
  document.getElementById("printSection").classList.remove("hidden");
}

function clearAll() {
  table.innerHTML = "";
  addRow();
  document.querySelector(".results").innerHTML = "";
  document.getElementById("printSection").classList.add("hidden");
}

function printPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const name = document.getElementById("studentName").value || "N/A";
  const roll = document.getElementById("rollNo").value || "N/A";
  const college = document.getElementById("collegeName").value || "N/A";

  doc.setFontSize(16);
  doc.text("YK's CGPA Calculator", 14, 15);
  doc.setFontSize(12);
  doc.text(`Name: ${name}`, 14, 25);
  doc.text(`Roll No: ${roll}`, 14, 32);
  doc.text(`College: ${college}`, 14, 39);

  const tableData = [];
  [...table.rows].forEach(row => {
    const subject = row.cells[0].querySelector("input").value || "-";
    const credits = row.cells[1].querySelector("input").value || "-";
    const grade = row.cells[2].querySelector("select").value || "-";
    tableData.push([subject, credits, grade]);
  });

  doc.autoTable({
    head: [['Subject', 'Credits', 'Grade']],
    body: tableData,
    startY: 45,
    theme: 'grid',
    styles: { cellPadding: 2, fontSize: 11 },
    headStyles: { fillColor: [0,0,0], textColor: [255,255,255] },
    bodyStyles: { textColor: [0,0,0] }
  });

  const y = doc.lastAutoTable.finalY + 10;
  const sgpa = document.getElementById("sgpa").innerText;
  const cgpa = document.getElementById("cgpa").innerText;
  const total = document.getElementById("totalCredits").innerText;

  doc.text(`${sgpa}`, 14, y);
  doc.text(`${cgpa}`, 14, y + 7);
  doc.text(`${total}`, 14, y + 14);
  doc.text("Thanks for using YK's CGPA Calculator 🙏", 14, y + 24);

  doc.save("CGPA_Report.pdf");
}
