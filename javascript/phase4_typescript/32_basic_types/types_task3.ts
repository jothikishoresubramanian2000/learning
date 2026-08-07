let name 

name = 'jk';
name = 80

function getsomething(){
    return "hi"
}
name = getsomething();

let nameU :unknown = getsomething()

//nameU.toUpperCase()// error says it is unknown

if(typeof nameU == "string"){
    nameU = nameU.toUpperCase()
}

console.log(nameU)