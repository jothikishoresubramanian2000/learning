let prices = [100,250,80,400]

let gstPrices = prices.map(p => (p*0.18) + p);

console.log(gstPrices)

let highAmount = prices.filter(a => a> 100);

console.log(highAmount)
