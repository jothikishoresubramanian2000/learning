
const pluck = <T,K extends keyof T>(obj:T,key:K):T[K] =>{

    return obj[key];
}

const book = { id: "B-01", title: "Clean Code", pages: 300 };


pluck(book, "title")   
pluck(book, "pages").toFixed(2) 
// pluck(book, "author") //Argument of type '"author"' is not assignable to parameter of type '"title" | "id" | "pages"'.

//pluck(book, "title").toFixed(2) //Property 'toFixed' does not exist on type 'string'.