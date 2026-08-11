const firstOrNull = <T>(arr: T[]): T | null => {
    return arr[0] ?? null;
}

console.log(firstOrNull([{id:1},{id:2}])?.id)
console.log(firstOrNull([]))

// const simple = (arr: any[]): any => {
//     return arr[0] ?? null;
// }

// //console.log(firstOrNull(["Hi","Hi"]).toFixed()) // error this caught because of our type checking thing
// console.log(simple(["Hi","Hi"]).toFixed(2)) // no error danger
// //console.log(firstOrNull([])?.foo) // this is interfered and error says no exists // but in simple function it doesn't capture at compile time
