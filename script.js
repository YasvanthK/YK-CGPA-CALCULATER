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
        </td>
    `;
    document.getElementById("subjectTable").appendChild(row);
}

function togglePrevious() {
    document.getElementById("previousSection").classList.toggle("hidden");
}

let SGPA = 0, CGPA = "", TOTAL_CREDITS = 0;

function calculate() {
    const rows = document.querySelectorAll("#subjectTable tr");

    let points = 0;
    let credits = 0;

    rows.forEach(r => {
        const c = parseFloat(r.children[1].querySelector("input").value);
        const g = parseFloat(r.children[2].querySelector("select").value);

        if (!isNaN(c) && !isNaN(g)) {
            credits += c;
            points += c * g;
        }
    });

    if (credits === 0) return;

    SGPA = (points / credits).toFixed(2);
    TOTAL_CREDITS = credits;

    document.getElementById("sgpa").innerText = `SGPA : ${SGPA}`;
    document.getElementById("totalCredits").innerText = `Total Credits : ${TOTAL_CREDITS}`;

    CGPA = "";

    if (prevToggle.checked) {
        const pc = parseFloat(prevCredits.value);
        const pg = parseFloat(prevCgpa.value);
        if (!isNaN(pc) && !isNaN(pg)) {
            CGPA = ((points + pg * pc) / (credits + pc)).toFixed(2);
            TOTAL_CREDITS += pc;
            document.getElementById("cgpa").innerText = `CGPA : ${CGPA}`;
            document.getElementById("totalCredits").innerText =
                `Total Credits : ${TOTAL_CREDITS}`;
        }
    } else {
        document.getElementById("cgpa").innerText = "";
    }

    document.getElementById("printSection").classList.remove("hidden");
}

function printPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Get student details
  const name = document.getElementById("studentName").value.trim() || "Student";
  const roll = document.getElementById("rollNo").value.trim() || "N/A";
  const college = document.getElementById("collegeName").value.trim() || "N/A";

  // PDF Title
  doc.setFontSize(16);
  doc.text("YK's CGPA Calculator", 14, 15);

  // Student details
  doc.setFontSize(12);
  doc.text(`Name: ${name}`, 14, 25);
  doc.text(`Roll No: ${roll}`, 14, 32);
  doc.text(`College: ${college}`, 14, 39);

  // Table data
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

  // Add results
  const y = doc.lastAutoTable.finalY + 10;
  const sgpa = document.getElementById("sgpa").innerText;
  const cgpa = document.getElementById("cgpa").innerText;
  const total = document.getElementById("totalCredits").innerText;

  doc.text(`${sgpa}`, 14, y);
  doc.text(`${cgpa}`, 14, y + 7);
  doc.text(`${total}`, 14, y + 14);
  doc.text("Thanks for using YK's CGPA Calculator 🙏", 14, y + 24);

  // Use student name as filename
  const fileName = `${name.replace(/\s+/g, "_")}_CGPA_Report.pdf`;
  doc.save(fileName);
}


