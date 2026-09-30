const twoSum = (arr,target) =>{
    const sumTwo = []
    let pairCount = 0
    for (let i=0; i< arr.length-1; i++){

        for(let j = i+1;j<arr.length;j++){
            if(arr[i]+arr[j] === target&& pairCount==0){
                sumTwo.push(arr[i],arr[j])
                pairCount = 1
                return sumTwo;
            }
        }
    }

    return sumTwo
}

console.log(twoSum([2, 7, 11, 15],9))
console.log(twoSum([3, 3, 4, 5],6))