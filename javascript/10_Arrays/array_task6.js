let orders = [
          { item: "pen",    amount: 50  },
          { item: "laptop", amount: 800 },
          { item: "book",   amount: 120 },
          { item: "mouse",  amount: 90  }
        ]


const total = orders
  .filter(o => o.amount > 100)   // keep big orders
  .map(o => o.amount)            // pull amounts
  .reduce((acc, n) => acc + n, 0); // sum
console.log(total);   




