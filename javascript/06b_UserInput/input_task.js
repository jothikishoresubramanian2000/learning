const prompt = require("prompt-sync")();

const name = prompt("Enter your name: ");

console.log("Welcome " + name);

const number1 = Number(prompt("Enter the number1: "));
const number2 = Number(prompt("Enter the number2: "));
console.log("Total = " , (number1 + number2));

const age = Number(prompt("Enter your age: "));

if (age >= 18)
    console.log("adult")
else
    console.log("minor")