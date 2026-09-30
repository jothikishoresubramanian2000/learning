function shiftString(str, shift) {
  let result = '';

  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);         
    const shifted = ((code - 97 + shift) % 26) + 97; 
    result += String.fromCharCode(shifted);
  }

  return result;
}

console.log(shiftString('abc', 2)); 
console.log(shiftString('xyz', 3));