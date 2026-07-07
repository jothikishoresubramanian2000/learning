const applyDiscount = (price, discountFn) => {
    return discountFn(price)
}

console.log(applyDiscount(1000, p => p- p * 0.10));
console.log(applyDiscount(1000, p => p - 50));     

greetDecl();                     
function greetDecl() { console.log("declaration works early"); }

greetArrow();                        
const greetArrow = () => console.log("arrow");
