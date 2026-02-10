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
    const name = studentName.value;
    const roll = rollNo.value;
    const college = collegeName.value;

    if (!name || !roll || !college) {
        alert("Please fill student details!");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // TITLE
    doc.setFontSize(16);
    doc.text("YK's CGPA Calculator", 105, 15, { align: "center" });

    // STUDENT DETAILS TABLE
    doc.autoTable({
        startY: 25,
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

    // FOOTER
    doc.setFontSize(10);
    doc.text(
        "Thanks for using YK's CGPA Calculator",
        105,
        doc.internal.pageSize.height - 10,
        { align: "center" }
    );

    doc.save("YK_CGPA_Report.pdf");
}
