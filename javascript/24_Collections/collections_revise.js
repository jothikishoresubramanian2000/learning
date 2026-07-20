const prs = [
    { dept: "IT",  amount: 5000 },
    { dept: "HR",  amount: 2000 },
    { dept: "IT",  amount: 3000 },
    { dept: "FIN", amount: 8000 },
    { dept: "IT",  amount: 1000 }
]


// const prCounts = new Map()
// const deptTotal = new Map()


// for (const pr of prs){
     
//     if(deptTotal.has(pr.dept)){
//         deptTotal.set(pr.dept,deptTotal.get(pr.dept)+pr.amount)
//     }
//     else(
//         deptTotal.set(pr.dept,0)
//     )
    
//     if(prCounts.has(pr.dept)){
        
        
        
//         prCounts.set(pr.dept,(prCounts.get(pr.dept))+1)
//     }
//     else{
        
//         prCounts.set(pr.dept, 1)
//     }
// }

// const distinct = [...new Set(prs.map(prs => prs.dept))]
// console.log(distinct)
// console.log(prCounts)
//  console.log(deptTotal);

const totals = prs.reduce((map, pr) => {
  map.set(pr.dept, (map.get(pr.dept) || 0) + pr.amount);
  console.log(map)
  return map;                      // ⭐ must return the accumulator each time
}, new Map());   

console.log(totals)// ← start value = an empty Map

