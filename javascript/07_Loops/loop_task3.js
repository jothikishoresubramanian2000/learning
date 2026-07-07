const studant = {
    name : "JK",
    role: "admin",
    age: 24
}

for(const oop in studant){
    console.log(oop + ' = ' + studant[oop])
    console.log()
}

const str = "hello";

for(let char in str){
    process.stdout.write(char)
}