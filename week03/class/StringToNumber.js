function convertStringToNumber(string, x=10) {
  const chars = string.split('');
  let number = 0;
  let i = 0;
  while (i < chars.length && chars[i] != '.') {
    number *= x;
    number += chars[i].codePointAt(0) - '0'.codePointAt(0);
    i++;
  }
  if (chars[i] == '.') {
    i++;
  }
  let fraction = 1;
  while (i < chars.length) {
    fraction /= x;
    number += (chars[i].codePointAt(0) - '0'.codePointAt(0)) * fraction;
    i++;
  }
  fraction = fraction / x;
  return number;
}
console.log(convertStringToNumber('10.0123'));

function convertNumberToString(number, x=10) {
  let integer = Math.floor(number);
  let fraction = number - integer;
  let string = '';
  
  while(integer > 0) {
    string = String(integer % x) + string;
    integer = Math.floor(integer / x);
  }

  return string;
}
console.log(convertNumberToString(100, 2));