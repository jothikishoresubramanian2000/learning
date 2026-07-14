const pr = { id: "PR-001", dept: "IT", amount: 24000, approved: false };

for(let key in pr){
    console.log(`${key} = ${pr[key]}`);
    
}

const amounts = [1200, 8000, 450, 15000]

for (const amt of amounts){
    if(amt > 10000)
        break;
    if (amt>1000){
        console.log(amt)
    }
}