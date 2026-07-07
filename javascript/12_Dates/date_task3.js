const birth = new Date("2000-01-01"), today = new Date("2026-01-11");

let age = today.getFullYear() - birth.getFullYear();
const notYet =
  today.getMonth() < birth.getMonth() ||
  (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate());
if (notYet) age--;
console.log(age)