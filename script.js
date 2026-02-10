const table = document.getElementById("subjectTable");

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

addRow();

function togglePrevious() {
document.getElementById("previousSection").classList.toggle("hidden");
}

function calculate() {
let totalCredits = 0;
let totalPoints = 0;

[...table.rows].forEach(row => {
const credits = row.cells[1].querySelector("input").value;
const grade = row.cells[2].querySelector("select").value;
if (credits && grade) {
totalCredits += Number(credits);
totalPoints += credits * grade;
}
});

if (totalCredits === 0) {
alert("Please enter valid data");
return;
}

let sgpa = (totalPoints / totalCredits).toFixed(2);

let cgpa = sgpa;

if (document.getElementById("prevToggle").checked) {
let prevCgpa = Number(prevCgpaInput.value);
let prevCredits = Number(prevCreditsInput.value);
let totalC = totalCredits + prevCredits;
cgpa = ((totalPoints + prevCgpa * prevCredits) / totalC).toFixed(2);
}

document.getElementById("sgpa").innerText = `SGPA: ${sgpa}`;
document.getElementById("cgpa").innerText = `CGPA: ${cgpa}`;
document.getElementById("totalCredits").innerText = `Credits: ${totalCredits}`;

document.getElementById("printSection").classList.remove("hidden");
}

function clearAll() {
table.innerHTML = "";
addRow();
document.querySelector(".results").innerHTML = "";
document.getElementById("printSection").classList.add("hidden");
}

function toggleDark() {
document.body.classList.toggle("dark");
}

function printPDF() {
const { jsPDF } = window.jspdf;
const doc = new jsPDF();
doc.text("YK's CGPA Calculator", 14, 15);
doc.save("CGPA_Report.pdf");
}
