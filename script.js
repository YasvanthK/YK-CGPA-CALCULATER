function addRow() {
    const row = document.createElement("tr");
    row.innerHTML = `
        <td><input type="text" placeholder="e.g., Subject"></td>
        <td><input type="number" min="1" placeholder="Credits"></td>
        <td>
            <select>
                <option value="">Grade</option>
                <option value="10">O (10)</option>
                <option value="9">A+ (9)</option>
                <option value="8">A (8)</option>
                <option value="7">B+ (7)</option>
                <option value="6">B (6)</option>
                <option value="5">C (5)</option>
                <option value="0">U (0)</option>
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

    document.getElementById("sgpa").innerText = SGPA;
    document.getElementById("totalCredits").innerText = TOTAL_CREDITS;

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
            document.getElementById("cgpa").innerText = CGPA;
            document.getElementById("totalCredits").innerText = TOTAL_CREDITS;
        }
    } else {
        document.getElementById("cgpa").innerText = "-";
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

    if (!studentNameEl.value.trim() || !rollNoEl.value.trim() || !collegeNameEl.value.trim()) {
        alert("Please fill student details!");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // CUSTOM MONOCHROME THEME DEFINITIONS
    const pdfStyles = {
        theme: "grid",
        headStyles: { fillColor: [17, 17, 17], textColor: [255, 255, 255], fontStyle: "bold", halign: "center" },
        styles: { font: "Helvetica", fontSize: 10, cellPadding: 5, lineColor: [220, 220, 220] }
    };

    // TITLE
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(18);
    doc.text("YK CGPA Calculator", 105, 18, { align: "center" });
    
    // TAGLINE
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(120); 
    doc.text("Your Grades. Your Growth.", 105, 25, { align: "center" });

    // RESET TEXT COLOR FOR RUNNING BODY
    doc.setTextColor(0);

    // STUDENT DETAILS TABLE
    doc.autoTable({
        startY: 32,
        theme: "grid",
        styles: { font: "Helvetica", fontSize: 10, cellPadding: 4, lineColor: [220, 220, 220] },
        columnStyles: { 0: { fontStyle: "bold", fillColor: [248, 248, 248], width: 40 } },
        body: [
            ["Name", name],
            ["Roll No", roll],
            ["College", college]
        ]
    });

    // PARSE SUBJECT TABLE FOR EXPORT
    const subjectData = [];
    document.querySelectorAll("#subjectTable tr").forEach(r => {
        subjectData.push([
            r.children[0].querySelector("input").value || "-",
            r.children[1].querySelector("input").value || "-",
            r.children[2].querySelector("select").selectedOptions[0].text || "-"
        ]);
    });

    // GENERATE SUBJECTS RECORD TABLE
    doc.autoTable({
        startY: doc.lastAutoTable.finalY + 10,
        ...pdfStyles,
        head: [["Subject Description", "Credits Earned", "Letter Grade Mapping"]],
        body: subjectData
    });

    // METRICS SUMMARY BLOCK
    const summary = [
        ["Semester SGPA", SGPA],
        ["Cumulative Credits Registered", TOTAL_CREDITS]
    ];
    if (CGPA) summary.splice(1, 0, ["Cumulative CGPA", CGPA]);

    doc.autoTable({
        startY: doc.lastAutoTable.finalY + 10,
        theme: "grid",
        styles: { font: "Helvetica", fontSize: 10, cellPadding: 5, lineColor: [220, 220, 220] },
        columnStyles: { 0: { fontStyle: "bold", fillColor: [248, 248, 248] }, 1: { halign: "center", fontStyle: "bold" } },
        body: summary
    });

    // CENTERING THE GRADE POINTS SYSTEM KEY
    const gradeLegend = [
        ["Grade", "Points"],
        ["O", "10"], ["A+", "9"], ["A", "8"], 
        ["B+", "7"], ["B", "6"], ["C", "5"], ["U", "0"]
    ];

    const pageWidth = doc.internal.pageSize.width;
    const legendWidth = 60;

    doc.autoTable({
        startY: doc.lastAutoTable.finalY + 12,
        head: [gradeLegend[0]],
        body: gradeLegend.slice(1),
        ...pdfStyles,
        margin: { left: (pageWidth - legendWidth) / 2 },
        tableWidth: legendWidth
    });

    // FOOTER LEGAL LINES
    const footerY = doc.internal.pageSize.height - 15;
    doc.setFontSize(9);
    doc.setTextColor(140);
    doc.text("© 2026 YK CGPA Calculator. All rights reserved.", 105, footerY, { align: "center" });

    // EXPORT PDF REPORT FILE
    const fileName = `${name.replace(/\s+/g, "_")}_CGPA_Report.pdf`;
    doc.save(fileName);
}
