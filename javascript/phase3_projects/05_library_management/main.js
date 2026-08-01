const{LibraryManager,DuplicateId,BookStateErrors} = require("./library")

const librarian = new LibraryManager()
function run(action){
    try{
        action()
    }
    catch(err){
        if(err instanceof DuplicateId||err instanceof BookStateErrors){
            console.log(err.message)
        }
        else throw err
    }
}
//--------add-------------
run(()=>{librarian.addBook("B-01","Clean code");console.log(`Book added`)})
run(()=>{librarian.addBook("B-02","You don't know JS");console.log(`Book added`)})
run(()=>{librarian.addBook("B-03","Refactoring");console.log(`Book added`)})
run(()=>{librarian.addBook("B-01","Clean code");console.log(`Book added`)})

//---------issue-------------
run(()=>{librarian.issue("B-01","kishore","2026-07-10");console.log(`Book issued`)})
run(()=>{librarian.issue("B-01","Jk","2026-07-10");console.log(`Book issued`)})
run(()=>{librarian.issue("B-99","Jk","2026-07-10");console.log(`Book issued`)})
//-------------return----------------//

run(()=>{const result = librarian.return("B-01","2026-07-15");if(result===0){console.log(`Book returned`)};console.log(`Book returned, fine amount: ${result}`)})
run(()=>{const result = librarian.return("B-02","2026-07-15");if(result===0){console.log(`Book returned`)};console.log(`Book returned, fine amount: ${result}`)})

//--------on time--------//
run(()=>{librarian.issue("B-02","Ravi","2026-07-20");console.log(`Book issued`)})
run(()=>{const result = librarian.return("B-02","2026-07-18");if(result===0){console.log(`Book returned`);return};console.log(`Book returned, fine amount: ${result}`)})
//--------------------------------//
run(()=>{console.log(`Available books`);console.table(librarian.available())})
run(()=>{console.log(`Issued books`);console.table(librarian.issued())})
run(()=>{console.log(`All books`);const result = librarian.list();console.table(result);console.log(`length:`,result.length)})