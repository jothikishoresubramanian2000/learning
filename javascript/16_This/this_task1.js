const prRequest ={
    id:"PR-001",
    printIdNormal(){console.log(this.id)},
    x: () =>{
      console.log(this.id) //this lives in a enclosed lexical context
    }
}

prRequest.printIdNormal();
prRequest.x();
