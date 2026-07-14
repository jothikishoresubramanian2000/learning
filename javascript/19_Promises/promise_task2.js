const submitted = (pr) =>{
    return new Promise((resolve,reject) =>{
        if (pr.id === "PR-001") {
            pr.status = "submitted";
            resolve(pr);
        } else {
            reject("invalid pr");
        }


    })
}

pr = {id:"PR-001"}

submitted(pr)
.then(pr =>{console.log(`${pr.id} ${pr.status}`); return pr;
})
.then(pr => {
    pr.status = "approved"
    console.log(`${pr.id} ${pr.status}`);
    return pr;
})
.then(pr => {
    pr.status = "notified"
    console.log(`${pr.id} ${pr.status}`); return pr;

})
.catch(err =>{console.log(`Error: ${err}`)})