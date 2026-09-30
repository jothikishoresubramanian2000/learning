const noDup = (str) =>{

    const string = new Set(str.split(""))

    console.log([...string].join(""))
}

noDup("programming")