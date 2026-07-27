

const timerFunction =()=>{
    let count = 0
    const id = setInterval(function cb(){ count++;
        if(count == 3){
            clearInterval(id)
        }
        console.log("tick")},1000)
}

timerFunction()