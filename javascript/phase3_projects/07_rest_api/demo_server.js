// DEMO server — study this after seeing it run. A student API with 2 routes.
const http = require("http");

// our "database" — just a Map (the manager idea from Projects 1-6, simplified)
const students = new Map();
students.set("S-01", { id: "S-01", name: "Ravi", marks: 80 });  // one seed row

// createServer takes ONE function that runs on EVERY request.
const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);          // log each request (server-side)

  // ROUTE 1: GET /students  → list all students
  if (req.method === "GET" && req.url === "/students") {
    const all = [...students.values()];
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(all));
    return;                                          // stop — response sent
  }

  // ROUTE 2: POST /students  → create a student (body has the data)
  if (req.method === "POST" && req.url === "/students") {
    let body = "";
    req.on("data", (chunk) => { body += chunk; });  // collect body pieces
    req.on("end", () => {                            // whole body arrived
      const student = JSON.parse(body);             // text → object
      students.set(student.id, student);            // store it
      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify(student));             // echo back what we created
    });
    return;
  }

  // NO ROUTE MATCHED → 404
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "not found" }));
});

server.listen(3000, () => console.log("Server on http://localhost:3000"));
