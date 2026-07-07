let a = {info: {count: 1}}

let b = {...a};

b.info.count = 99;
console.log(a.info.count) // swallow copy nested feilds address in stored not values, so they become shared across

let d = structuredClone(a);
d.info.count = 500;

console.log(d.info.count)
console.log(a.info.count)