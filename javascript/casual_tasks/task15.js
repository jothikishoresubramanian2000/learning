const vowels = "aeiou"

let string = "Apple".toLowerCase().replace(/\s+/g, "");

let onlyVowels = string.split("").filter(arr => vowels.includes(arr)).length
console.log(onlyVowels)