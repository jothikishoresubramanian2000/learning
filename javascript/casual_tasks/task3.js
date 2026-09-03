function isBalanced(str) {
    const stack = [];

    for (const char of str) {

        if (char === "(" || char === "[" || char === "{") {
            stack.push(char);
        }

        
        else {
            if (stack.length === 0) {
                return false;
            }

            const last = stack.pop();

            if (
                (char === ")" && last !== "(") ||
                (char === "]" && last !== "[") ||
                (char === "}" && last !== "{")
            ) {
                return false;
            }
        }
    }

    return stack.length === 0;
}

console.log(isBalanced("{[()()]}")); 
console.log(isBalanced("{[(])}"));   
console.log(isBalanced("(]"));       