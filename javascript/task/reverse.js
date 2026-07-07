let number = 1234;
let temp = number;
let num = 0;
while(temp != 0){
    reminder = temp%10
    num = (num * 10) + reminder
    temp = Math.floor(temp / 10)
}
console.log(num)