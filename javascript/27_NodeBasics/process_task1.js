const args = process.argv
const approvalLimit = process.env.APPROVAL_LIMIT || 10000
const gstAmount = Number(args[3]) + Number(args[3])*0.18
console.log(args[2])
console.log(gstAmount)
console.log(`within limit: ${Number(args[3])<approvalLimit}`)