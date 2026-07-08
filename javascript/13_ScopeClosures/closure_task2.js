const counter = () =>{
    let count = 0;

    return function() {
        count ++;
        return count;
    }
}
const a = counter()
a();
a(); //3
console.log(a())
b= counter()
console.log(b()) // second counter start from 1