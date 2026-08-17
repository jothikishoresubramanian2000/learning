type ScoreCard = Record<"math"|"science",number>

const myScoreboard: ScoreCard = {
    math: 70,
    science: 93
    //history: 90 it does not exists
}

interface HasId{
    id: string,
    price: number,
}

type gData<T extends HasId> = Map<string,T>;


const myMap: gData<{ id: string; price: number }> = new Map([
    ["PR-001", { id: "PR-001", price: 10 }]
]);

myMap.set("PR-002",{ id: "PR-002", price: 100 })
console.log(myMap)