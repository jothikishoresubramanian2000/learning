function snip1(){
    x = "TCA"
    console.log(x())
}


function snip2(){
    console.log(x)
}

function snip3(){
    console.log(x)
    const x ="Thalapathy vetri Kondan"
}

snip1() // x is string and we try to access as function, so it says x is not a function
snip2() // In this, there is x is not there itself, so not defined
snip3() // here x is defined but accessed in before hand