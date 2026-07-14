let status = ["PENDING","REJECTED"];

for(let stat of status){

    switch(stat){
        case "PENDING":
            console.log("waiting");
            break;
        case "APPROVED":
            console.log("done");
            break;
        default:
            console.log("stopped");
        }
}
