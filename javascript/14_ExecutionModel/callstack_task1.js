function a() { 
    console.log("a start") 
    b(); 
    console.log("a end")
}
function b() {
    console.log("b start") 
    c(); 
    console.log("b end")
}
function c() { 
    console.log("c start") 
    console.log("c end") 
}
a(); //In js, call stack is last in first out, in this code
// all function do the start log first and at c it log the line next line which is end and after that
// it returns the control to function b and goes to the next line which is log of b end and same to a

function recursion(){
    return recursion();
}
recursion()
