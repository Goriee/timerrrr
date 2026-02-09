
const dateStr = "2026-02-10T12:00:00.000Z";
const date = new Date(dateStr);
const offset = date.getTimezoneOffset() * 60000;
const localDate = new Date(date.getTime() - offset);
const localInput = localDate.toISOString().slice(0, 16);

console.log("Original UTC:", dateStr);
console.log("Offset (mins):", date.getTimezoneOffset());
console.log("Local Input String:", localInput);

// Reverse (Submit)
const inputVal = localInput; 
console.log("Input Value:", inputVal);
const submitDate = new Date(inputVal); // Interpeted as local
console.log("Submitted ISO (UTC):", submitDate.toISOString());

console.log("Match?", date.toISOString() === submitDate.toISOString());
