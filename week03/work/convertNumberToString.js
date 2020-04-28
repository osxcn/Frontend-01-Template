/**
 * 数值转字符串
 * @param {string} string 待转换为字符串的数值
 * @param {number|undefined} hex 进制
 */
function convertNumberToString(number, hex) {
  // 进制判断
  if (arguments.length < 2 || typeof hex !== 'number') {
    hex = 10;
  } else if (hex < 2 || hex > 36) {
    return '';
  }
  // 如果为0，直接返回'0'
  if (number === 0) return '0';

  // 数值符号判断
  let sign = number > 0 ? '' : '-';

  // 将数值转换为正数
  number = Math.abs(number);
  // 分离整数和小数
  let integer = Math.floor(number);
  let fraction = number - integer;
  // 整数部分为0，则前置补零
  integer === 0 && (string += '0');
  let string = integer === 0 ? '0' : '';

  while (integer > 0) {
    string = String(integer % hex) + string;
    integer = Math.floor(integer / hex);
  }

  if (fraction !== 0) {
    let fractionStr = '';
    while (fraction && fractionStr.length < 20) { // 最大保留20位小数
      fraction *= hex;
      fractionStr += String(Math.floor(fraction));
      fraction -= Math.floor(fraction);
    }
    string += '.' + fractionStr;
  }

  return sign + string;
}

console.log(convertNumberToString(0, 10));  // "0"
console.log(convertNumberToString(123.456, 10)); // "123.45600000000000306954"
console.log(convertNumberToString(10.25, 8)); // "12.2"
console.log(convertNumberToString(16.5, 16)); // "10.8"
console.log(convertNumberToString(-164568684, 20)); // "-2118111144"