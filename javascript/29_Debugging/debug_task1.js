  function tax(pr)      { return (pr.amount||0) * 0.18; }
  function total(pr)    { return (pr.amount||0) + tax(pr); }
  function report(prs)  { return prs.map(pr => total(pr)); }
  console.log(report([{ id: "PR-001", amount: 5000 }, { id: "PR-002" }]));


  /* Answers:
  1. NAN - Not a number
  2. I guess the first accessed function total()- this one
  3. pr.amount - narrow, and I didn't predict the case of amount being absent
  4.I just added ||*/