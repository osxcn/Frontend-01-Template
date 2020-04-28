/**
 * 字符串转数值
 * @param {string} string 待转换为数值的字符串
 * @param {number|undefined} hex 进制
 */
function convertStringToNumber(string, hex) {
  // 进制判断
  if (arguments.length < 2 || typeof hex !== 'number') {
    hex = 10;
  } else if (hex < 2 || hex > 36) {
    return NaN;
  }
  // 可用的char列表
  const charList = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'.slice(0, hex).split('');

  // 将传入的值转换为字符数组
  const chars = string.toUpperCase().split('');

  // 如果第一个字符不在可用列表中，返回NaN
  if (!charList.includes(chars[0]) && chars[0] !== '.') return NaN;
  // 整数部分
  let number = 0;
  let i = 0;
  for (; i < chars.length && chars[i] !== '.'; i++) {
    const char = chars[i];
    // 如果字符不在可用列表中，返回已生成的数值
    if (!charList.includes(char)) return number;
    number *= hex;
    number += getNumberByChar(char);
  }
  chars[i] === '.' && i++;
  // 小数部分
  let fraction = 1;
  for (;i < chars.length; i++) {
    const char = chars[i];
    // 如果字符不在可用列表中，判断：如果是.char，则返回NaN，否则返回已生成的数值
    if (!charList.includes(char)) return chars[0] === '.' && i === 1 ? NaN : number;
    fraction /= hex;
    number += getNumberByChar(char) * fraction;
  }
  fraction /= hex;

  return number;
  
  // 根据字符获取数值
  function getNumberByChar(char) {
    // 字符0对应的ASCII值
    const zeroCodePoint = '0'.codePointAt(0);
    let number = char.codePointAt(0) - zeroCodePoint;
    // 如果是A-Z之间的字符，需要进行修正
    const index = charList.indexOf(char);
    return index < 10 ? number : number - 7;
  }
}

// 2进制
console.log(convertStringToNumber('0', 2)); // 0
console.log(convertStringToNumber('01', 2)); // 1
console.log(convertStringToNumber('1.1', 2)); // 1.5
console.log(convertStringToNumber('1E1', 2)); // 1
// 8进制
console.log(convertStringToNumber('107', 8)); // 71
console.log(convertStringToNumber('0.17', 8)); // 0.234375
console.log(convertStringToNumber('5A1.1', 8)); // 5
// 10进制
console.log(convertStringToNumber('123.4')); // 123.4
console.log(convertStringToNumber('0.514')); // 0.514
console.log(convertStringToNumber('.0')); // 0
console.log(convertStringToNumber('9.')); // 9
console.log(convertStringToNumber('9.A')); // 9
console.log(convertStringToNumber('.A')); // NaN
// 16进制
console.log(convertStringToNumber('.A', 16)); // 0.625
console.log(convertStringToNumber('C.A', 16)); // 12.625
console.log(convertStringToNumber('DA', 16)); // 218
console.log(convertStringToNumber('1B', 16)); // 27
console.log(convertStringToNumber('.AGA', 16)); // 0.625
// 20进制
console.log(convertStringToNumber('.AG', 20)); // 0.54
// 不允许范围内的进制
console.log(convertStringToNumber('0', 1)); // NaN
console.log(convertStringToNumber('AA', 37)); // NaN
