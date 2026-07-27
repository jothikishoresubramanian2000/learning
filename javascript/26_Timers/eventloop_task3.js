
time = setTimeout(()=>{console.log("timer done")},0) 
for(let i = 0; i<=20;i++){
    if(i==20){
        console.log("sync done")
    }
}

 // syncronous thread is priority is js, this for loop first in call stack
 // the async function waits in webapi or whatever the global environment, and once all code is gone finished
 // the asyn function is pushed inside the callback queue and the event listener see if call stack is free
 // if free global execution context is created and then the asyn function is done and pushed out of the execution context and as well the call queue