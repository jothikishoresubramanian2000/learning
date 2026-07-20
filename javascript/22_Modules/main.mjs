import { makePrId,gstAmt } from "./prUtils.mjs";
import { Budget,cbudget } from "./budget.mjs";

makePrId(7);
gstAmt(5000);

const prb1 = new Budget(10000)
console.log(prb1.spend(3000))

const cprb = cbudget(10000)
console.log(cprb.spend(3000));


