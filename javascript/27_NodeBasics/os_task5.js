const os = require("os")

console.log(`platform: ${os.platform()}`)
console.log(`cores: ${os.cpus().length}`)
console.log(`Free memory: ${(os.freemem() / 1024 / 1024).toFixed(2)} MB`);