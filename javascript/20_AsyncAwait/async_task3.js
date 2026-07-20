const getSupplier =  (id)=>{
    return new Promise((resolve) =>{
        setTimeout(()=>{
            resolve(id)
        },1000)
    })
}

async function sequential() {
    let start = Date.now()
    let supplier1 = await getSupplier("SUP-001")
    let supplier2 = await getSupplier("SUP-002")
    let supplier3 = await getSupplier("SUP-003")
    
    let end = Math.round((Date.now() - start)/1000)
    console.log(`Sequential took ~${end}s`);

}

async function parallel() {
    let start = Date.now()
    const [a, b, c] = await Promise.all([
    getSupplier("PR-001"),
    getSupplier("PR-002"),
    getSupplier("PR-003"),
  ]); 

  const secs = Math.round((Date.now() - start) / 1000);
  console.log(`Parallel took ~${secs}s`);
}

async function main() {
  await sequential();   
  await parallel();     
}
main();
