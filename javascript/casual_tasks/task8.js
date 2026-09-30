const arr1 = [1, 2, 3, 4, 5]

const sortedArr = [...arr1].sort((a, b) => a - b)

console.log(
    JSON.stringify(arr1) === JSON.stringify(sortedArr)
)