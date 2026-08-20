import express, { Request, Response } from "express";

const app = express();

interface response{id: string, name: string}
interface StudentParams {
    id: string;
}

app.get("/students/:id",(req: Request<StudentParams>, res: Response<response>)=>{

    const id: string= req.params.id
    res.status(201).json({id, name: "kishore"})
} )

app.listen(4000,()=>{console.log("server listening on port 4000")})

