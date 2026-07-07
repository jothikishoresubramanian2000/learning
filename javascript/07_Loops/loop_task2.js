for (let i =0; i<3; i++){
    for (let j = 0; j<5; j++){
        process.stdout.write("*"); 
    }
    console.log()
}

for(let i = 1; i <=5; i++){
    if (i === 3){
        continue;
    }
    if(i===5){
        break;
    }
    console.log(i)
}