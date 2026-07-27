const prs = [{id:"PR-001",dept:"IT",amount:5000},{id:"PR-002",dept:"HR",amount:2000}]

console.table(prs)

const nested = { a: { b: { c: { d: "deep" } } } };
console.dir(nested, { depth: null });
console.time("work")
for(let i = 0; i<10;i++){
    
}
console.timeEnd("work")
const name = "kishore"
console.log({name})

const getPr = (id) =>
  new Promise((resolve) => setTimeout(() => resolve({ id, amount: 5000 }), 300));

// WRONG — no await
const wrong = getPr("PR-001");
console.log("without await:", wrong);       // Promise { <pending> }
console.log("its .id:", wrong.id);          // undefined (Promises have no .id)

// RIGHT — await inside an async function (await is only legal inside async)
async function main() {
  const pr = await getPr("PR-001");          // wait, then unwrap the value
  console.log("with await:", pr);            // { id: 'PR-001', amount: 5000 }
  console.log("its .id:", pr.id);            // "PR-001"
}
main();