const approver = (max_limit) =>{
    let limit = max_limit;
    return function(){
        limit --;
        return limit>=0?`Approved. ${limit} left`:`Limit reached`
    }
}

const kishore = approver(2)
console.log(kishore())
console.log(kishore())
console.log(kishore())
console.log(kishore())
