/**
 * 获取值的原始类型字符串，例如[object Object]。
 */
const _toString = Object.prototype.toString;

/** 判断传入值是否为定义 */
function isDef(v) {
  return v !== undefined && v !== null;
};

/** 判断传入值是否为未定义 */
function isUndef(v) {
  return v === undefined || v === null;
};

/**
 * 快速对象检查 - 当我们知道值是符合JSON的类型时，它主要用于从原始值告诉对象。
 */
function isObject(obj) {
  return obj !== null && typeof obj === 'object';
};

/**
 * 严格的对象类型检查。 仅对纯JavaScript对象返回true。
 */
function isPlainObject(obj) {
  return _toString.call(obj) === '[object Object]';
};

/** 判断是否为字符串 */
function isString(obj) {
  return _toString.call(obj) === '[object String]';
};

/** 判断是否为非NaN数值 */
function isNumber(obj) {
  return _toString.call(obj) === '[object Number]' && !isNaN(obj);
};

/** 判断是否为布尔类型 */
function isBoolean(v) {
  return _toString.call(v) === '[object Boolean]';
};

/** 是否为true */
function isTrue(v) {
  return v === true;
};

/** 是否为false */
function isFalse(v) {
  return v === false;
};

/** 判断是否为函数 */
function isFunction(fn) {
  return _toString.call(fn) === '[object Function]';
};

/** 判断是否为正则 */
function isRegExp(v) {
  return _toString.call(v) === '[object RegExp]';
};

/** 判断是否为Promise */
function isPromise(val) {
  return (
    isDef(val) &&
    typeof val.then === 'function' &&
    typeof val.catch === 'function'
  );
};

/**
 * 传入值是否为空
 * @param {*} v 传入值
 */
function isEmpty(v) {
  if (isBoolean(v) || isNumber(v)) return false;

  if (isArray(v)) {
    if (v.length === 0) return true;
  } else if (isObject(v)) {
    if (JSON.stringify(v) === '{}') return true;
  } else {
    return isUndef(v) || v === '';
  }
  return false;
}

/**
 * 传入值是否为非空
 * @param {*} value 传入值
 */
function isNotEmpty(value) {
  return !isEmpty(value);
}

module.exports = {
  isDef,
  isUndef,
  isObject,
  isPlainObject,
  isString,
  isArray: Array.isArray,
  isNumber,
  isBoolean,
  isTrue,
  isFalse,
  isFunction,
  isRegExp,
  isPromise,
  isEmpty,
  isNotEmpty
};
