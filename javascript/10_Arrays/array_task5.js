let nums = [40, 10, 30, 20];

let number1 = nums.find(a => a > 25);

console.log(number1)
let sum = nums.reduce((acc,n)=>acc+n,0);
console.log(sum);


nums.sort((a,b)=> a-b); 
console.log(nums)
console.log(nums.sort())// sort as text normal sort