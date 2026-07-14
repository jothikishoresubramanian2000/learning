const getPr = (pr) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (pr.amount < 7000) {
                resolve(pr);
            } else {
                reject("PR amount high");
            }
        }, 1000);
    });
};

const prList = [
    { id: "PR-001", amount: 5000 },
    { id: "PR-002", amount: 8000 },
    { id: "PR-003", amount: 2000 }
];

Promise.all(prList.map(pr => getPr(pr)))
    .then(results => {
        const total = results.reduce((sum, pr) => sum + pr.amount, 0);
        console.log(`Total: ${total}`);
    })
    .catch(err => {
        console.log(`Failed: ${err}`);
    });