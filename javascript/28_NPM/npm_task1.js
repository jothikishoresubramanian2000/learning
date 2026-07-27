const dayjs = require("dayjs");

const today = dayjs().format("DD/MM/YYYY");

let dueDate = dayjs().add(30, "day").format("DD/MM/YYYY");
console.log(today);console.log(dueDate);
