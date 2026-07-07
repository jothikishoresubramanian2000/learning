let csvString = "kishore,admin,24";
let splitedString = csvString.split(",");


for(let chars of splitedString){
    console.log(chars)
}

let myEmail = "kishore@gmail.com";
myEmail = myEmail.split("@")
console.log(myEmail[1]);

let str = "hello";
str[0] = "H"
console.log(str)

str = str.replace("h","H") //replace the first instance of h to H, resturn new string not change in place
console.log(str)