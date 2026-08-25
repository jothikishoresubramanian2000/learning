const sentence = "the quick brown fox"


const stringRev = (sentence) =>{
    const revString = sentence.split(" ")
    const mymap = revString.map(element => element.split("").reverse().join(""));
    return mymap
}

console.log(stringRev(sentence).join(" "))