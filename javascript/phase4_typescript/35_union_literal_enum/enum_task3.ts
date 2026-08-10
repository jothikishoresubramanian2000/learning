enum Status{

    Active = "active",
    Inactive = "inactive"
}

const status: Status = Status.Active

console.log(status)


//-----------part B -------------//

type Success = {status: "ok", data: string}

type Failure = {status:"error",message: string}

type ApiResult = Success | Failure

const handle =(r: ApiResult) =>{

    if (r.status === "ok"){
        console.log(r.data)
    }
    else{
        console.log(r.message)
    }
}

handle({status: "ok",data: "Welcome JS"})
handle({status: "error",message: "not found"})