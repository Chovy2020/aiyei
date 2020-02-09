import moment from 'moment'

// 延时
export const delay = timeout => new Promise(reslove => setTimeout(reslove, timeout))
// 打印当前时间(微秒)
export const printTime = (sign = '') => {
  console.log(sign, `${moment(new Date()).second()}-${moment(new Date()).millisecond()}`)
}
// 随机生成颜色
export const getColor = str => {
  let hash = 1315423911
  for (let i = str.length - 1; i >= 0; i--) {
    const ch = str.charCodeAt(i)
    hash ^= (hash << 5) + ch + (hash >> 2)
  }
  return (hash & 0x7fffff).toString(16)
}

// 渐变色
export const gradientColors = (start, end, steps) => {
  let i,
    j,
    ms,
    me,
    output = [],
    so = []
  const normalize = channel => {
    return Math.pow(channel / 255, 1)
  }
  start = parseColor(start).map(normalize)
  end = parseColor(end).map(normalize)
  for (i = 0; i < steps; i++) {
    ms = i / (steps - 1)
    me = 1 - ms
    for (j = 0; j < 3; j++) {
      so[j] = pad(Math.round(Math.pow(start[j] * me + end[j] * ms, 1) * 255).toString(16))
    }
    output.push('#' + so.join(''))
  }
  return output
}
const pad = s => {
  return s.length === 1 ? '0' + s : s
}
const parseColor = hexStr => {
  return hexStr.length === 4
    ? hexStr
      .substr(1)
      .split('')
      .map(function (s) {
        return 0x11 * parseInt(s, 16)
      })
    : [hexStr.substr(1, 2), hexStr.substr(3, 2), hexStr.substr(5, 2)].map(function (s) {
      return parseInt(s, 16)
    })
}