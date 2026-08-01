// WORKING but bad. Refactor it. Behavior must stay identical.
function highValueGstPrs(prs, amountLimit) {
 
  
  return prs
        .filter(pr => pr.amount > 0)
        .map(pr => ({id: pr.id, gstTotal: pr.amount +pr.amount *0.18})) // t hear is amount inclusive gst, so changing it into gstTotal
        .filter(pr => pr.gstTotal > amountLimit)
}
const result = highValueGstPrs([{id:"PR-001",amount:5000},{id:"PR-002",amount:0},{id:"PR-003",amount:20000}], 5000)
console.log(result)
// Output: [ { id: 'PR-001', gstTotal: 5900 }, { id: 'PR-003', gstTotal: 23600 } ]
