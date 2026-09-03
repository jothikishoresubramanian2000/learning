const arr = [10, 5, 8, 20, 20, 3]

const sorted = [...new Set(arr.sort((a,b) => b-a))];

console.log(sorted[1])