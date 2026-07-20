const prRequest ={
    id:"PR-001",
    printIdNormal(){console.log(this.id)},
    x: () =>{
      console.log(this.id) //this lives in a enclosed lexical context
    }
}

const prRequest2 ={
    id:"PR-002",
}
prRequest.printIdNormal();
prRequest.x();
