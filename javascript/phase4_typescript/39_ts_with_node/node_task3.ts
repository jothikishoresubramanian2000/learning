import express, { Request, Response } from "express";

const app = express();
app.use(express.json());

interface StudentParams {
    name: string
    mark: number;
}

type response = Required<StudentParams>

app.post("/students",(req: Request<{},response,StudentParams>, res: Response<response>) =>{
    const data = req.body
    res.status(201).json(data)
})

app.listen(4000,()=>{console.log("server listening on port 4000")})