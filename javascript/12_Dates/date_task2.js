const start = new Date("2026-01-01"), end = new Date("2026-01-11");

let diffMs = end - start;

let diffDays = diffMs/(1000*60*60*24);
console.log(diffDays)