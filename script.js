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

function removeLastRow() {
    const table = document.getElementById("subjectTable");
    const rows = table.querySelectorAll("tr");
    if (rows.length > 1) {
        table.removeChild(rows[rows.length - 1]);
    } else {
        alert("At least one subject must remain!");
    }
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

    const prevToggleEl = document.getElementById("prevToggle");
    const prevCgpaEl = document.getElementById("prevCgpa");
    const prevCreditsEl = document.getElementById("prevCredits");

    if (prevToggleEl.checked) {
        const pc = parseFloat(prevCreditsEl.value);
        const pg = parseFloat(prevCgpaEl.value);
        if (!isNaN(pc) && !isNaN(pg)) {
            CGPA = ((points + pg * pc) / (credits + pc)).toFixed(2);
            TOTAL_CREDITS += pc;
            document.getElementById("cgpa").innerText = `CGPA : ${CGPA}`;
            document.getElementById("totalCredits").innerText = `Total Credits : ${TOTAL_CREDITS}`;
        }
    } else {
        document.getElementById("cgpa").innerText = "";
    }

    document.getElementById("printSection").classList.remove("hidden");
}

function printPDF() {
    const studentNameEl = document.getElementById("studentName");
    const rollNoEl = document.getElementById("rollNo");
    const collegeNameEl = document.getElementById("collegeName");

    const name = studentNameEl.value.trim() || "-";
    const roll = rollNoEl.value.trim() || "N/A";
    const college = collegeNameEl.value.trim() || "N/A";

    if (!name || !roll || !college) {
        alert("Please fill student details!");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // TITLE
    doc.setFontSize(16);
    doc.text("YK CGPA Calculator", 105, 15, { align: "center" });
    // TAGLINE
   doc.setFontSize(10);
   doc.setTextColor(120); // grey color for premium look
   doc.text("Your Grades. Your Growth.", 105, 22, { align: "center" });
   doc.text("", 105, 22, { align: "center" });

  // Reset text color back to black after tagline
  doc.setTextColor(0);

    // DATE
    doc.setFontSize(11);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 160, 25, { align: "right" });

    // STUDENT DETAILS TABLE
    doc.autoTable({
        startY: 30,
        theme: "grid",
        styles: { fontSize: 11 },
        body: [
            ["Name", name],
            ["Roll No", roll],
            ["College", college]
        ]
    });

    // SUBJECT TABLE
    const subjectData = [];
    document.querySelectorAll("#subjectTable tr").forEach(r => {
        subjectData.push([
            r.children[0].querySelector("input").value || "-",
            r.children[1].querySelector("input").value || "-",
            r.children[2].querySelector("select").selectedOptions[0].text || "-"
        ]);
    });

    doc.autoTable({
        startY: doc.lastAutoTable.finalY + 10,
        head: [["Subject", "Credits", "Grade"]],
        body: subjectData,
        theme: "grid",
        styles: { fontSize: 11 }
    });

    // SUMMARY TABLE
    const summary = [
        ["SGPA", SGPA],
        ["Total Credits", TOTAL_CREDITS]
    ];
    if (CGPA) summary.splice(1, 0, ["CGPA", CGPA]);

    doc.autoTable({
        startY: doc.lastAutoTable.finalY + 10,
        theme: "grid",
        styles: { fontSize: 11 },
        body: summary
    });

    // GRADE LEGEND TABLE
    const gradeLegend = [
        ["Grade", "Points"],
        ["O", "10"],
        ["A+", "9"],
        ["A", "8"],
        ["B+", "7"],
        ["B", "6"],
        ["C", "5"],
        ["U", "0"]
    ];

    const pageWidth = doc.internal.pageSize.width;
    const legendWidth = 60;

    doc.autoTable({
        startY: doc.lastAutoTable.finalY + 10,
        head: [gradeLegend[0]],
        body: gradeLegend.slice(1),
        theme: "grid",
        styles: { fontSize: 10 },
        margin: { left: (pageWidth - legendWidth) / 2 },
        tableWidth: legendWidth
    });

    // FOOTER
    const footerY = doc.internal.pageSize.height - 15;
    doc.setFontSize(10);
    
    
    doc.text("© 2026 YK CGPA Calculator. All rights reserved.", 105, footerY, { align: "center" });

    // SAVE PDF
    const fileName = `${name.replace(/\s+/g, "_")}_CGPA_Report.pdf`;
    doc.save(fileName);
}




