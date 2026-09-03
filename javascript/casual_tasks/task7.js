const findBig = (str) =>{

    const strArr = str.split(" ")

    const largest = strArr.reduce((lar,crr)=>{

        if(lar.length>crr.length){
            return lar
        }
        return crr
    },"")
    console.log(largest)
}

findBig("the quick brown fox jumped")