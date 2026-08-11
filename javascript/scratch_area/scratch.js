// pick a property — the value comes back with its real type
function firstOf(items){
  return items[0];
}
const u = firstOf([{ id: 1 }, { id: 2 }]);   // u is { id: number } | undefined

console.log(u)