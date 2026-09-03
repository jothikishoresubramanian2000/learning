const highAge = (obj) =>{

    let higAge = 0
    let person = 0
    higAge = obj.reduce((high,crr,index)=> {
        
        if(crr.age>high){
            person = index
            high = crr.age
        }
        return high
    },0)

    console.log(obj[person].name)
}

const arr = [{name:"A",age:25},{name:"B",age:40},{name:"C",age:33}]
highAge(arr)
