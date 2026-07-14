const EventEmitter = require("events");
const bus = new EventEmitter();

bus.on("pr.submitted",(pr)=>{
    console.log("Email send for", pr)
})

bus.on("pr.submitted",(pr)=>{
    console.log("Audit logged for", pr)
})

bus.emit("pr.submitted","PR-001")
bus.emit("pr.submitted","PR-002") // It doesn't need to know who, it just needs to pr.submitted? and the listeners just do their job