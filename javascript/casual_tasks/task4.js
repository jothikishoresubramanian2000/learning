const isAnagram = (str1, str2) => {
    
    if (str1.length !== str2.length) {
        return false;
    }

    str1 = str1.toUpperCase()
    str2 = str2.toUpperCase()

    return str1.split("").sort().join("") ===
           str2.split("").sort().join("");
};

console.log(isAnagram("listen","silent"))
console.log(isAnagram("hello","world"))
