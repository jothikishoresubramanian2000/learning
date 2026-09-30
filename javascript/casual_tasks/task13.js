const products = { apples: 3, bananas: 5, cherries: 2 }


const total = Object.values(products).reduce((acc,n) => acc + n,0)

console.log(total)