# 作业地址

## 写一个正则表达式 匹配所有 Number 直接量
[Number validate](work/number.html)

## 写一个 UTF-8 Encoding 的函数
[UTF-8 Encoding](work/utf8-encoding.html)

## 写一个正则表达式，匹配所有的字符串直接量，单引号和双引号（未完成）
[String validate](work/string-validate.html)

# 作业总结

在写Number字面量解析的过程中，通过阅读ECMA-262中关于Number的定义，以及设定用例实际执行，对其解析有了更深入的了解，同时加深了对RegExp的了解。

对于UTF8_Encoding这个函数，反复听了几遍课程，依旧没有弄清楚这个函数究竟需要达到一个什么效果。是返回一个Buffer对象？是将字符串解析成存储于内存中的二进制？还是其他什么东西？
不过，在这过程中，也了解了UTF-8的编码规则。

而字符串字面量的解析，由于时间实在不够，未能完成。留待后续补全。

## UTF-8编码规范

1）对于单字节的符号，字节的第一位设为0，后面7位为这个符号的 Unicode 码。因此对于英语字母，UTF-8 编码和 ASCII 码是相同的。

2）对于n字节的符号（n > 1），第一个字节的前n位都设为1，第n + 1位设为0，后面字节的前两位一律设为10。剩下的没有提及的二进制位，全部为这个符号的 Unicode 码。

编码规则表
| Unicode符号范围(十六进制) | UTF-8编码方式（二进制） |
| :--: | :-- |
| 0000 0000-0000 007F | 0xxxxxxx |
| 0000 0080-0000 07FF | 110xxxxx 10xxxxxx |
| 0000 0800-0000 FFFF | 1110xxxx 10xxxxxx 10xxxxxx |
| 0001 0000-0010 FFFF | 11110xxx 10xxxxxx 10xxxxxx 10xxxxxx |
| 0020 0000-03FF FFFF | 111110xx 10xxxxxx 10xxxxxx 10xxxxxx 10xxxxxx |
| 0400 0000-7FFF FFFF | 1111110x 10xxxxxx 10xxxxxx 10xxxxxx 10xxxxxx 10xxxxxx |