const giveBonus = <T extends {salary: number}>(item: T):number =>{

    return item.salary + item.salary * 0.10;

}



console.log(giveBonus({ name: "K", salary: 50000 })  );
console.log(giveBonus({ id: "E-1", salary: 40000, dept:"IT"}) );

        

//giveBonus({ name: "K" })   error
