const listDept = ["IT", "HR", "IT", "FIN", "HR", "IT"];

const setListDept = [...new Set(listDept)]
console.log(setListDept)
console.log(setListDept.length);
console.log(setListDept.includes("HR"));

//or

const alistDept = ["IT", "HR", "IT", "FIN", "HR", "IT"];
const slist = new Set()
for (let lists of alistDept){
    slist.add(lists)
}

console.log(slist)
console.log(slist.size);
console.log(slist.has("HR"));


