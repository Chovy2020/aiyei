import moment from 'moment'
import _ from 'lodash'

// 延时
export const delay = timeout => new Promise(reslove => setTimeout(reslove, timeout))

// 打印当前时间(微秒)
export const printTime = (sign = '') => {
  console.log(sign, `${moment(new Date()).second()}-${moment(new Date()).millisecond()}`)
}

// 转换成百分数 保留2位小数
export const toPercent = point => {
  let str = Number(point * 100).toFixed(2)
  str += '%'
  return str
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
        .map(function(s) {
          return 0x11 * parseInt(s, 16)
        })
    : [hexStr.substr(1, 2), hexStr.substr(3, 2), hexStr.substr(5, 2)].map(function(s) {
        return parseInt(s, 16)
      })
}

// 拼接5个主键 全局保持顺序统一
export const waferToId = wafer => {
  if (!wafer || wafer === {}) return ''
  return `${wafer.lotId}|${wafer.waferNo}|${wafer.productId}|${wafer.stepId}|${wafer.scanTm}`
}

// 5个主键 + defectId 拼接的字符串 => 标准数据
export const defectIdsToWafers = defectIds => {
  const wafers = []
  for (const id of defectIds) {
    const key = id.split('|')
    const lotId = key[0]
    const waferNo = key[1]
    const productId = key[2]
    const stepId = key[3]
    const scanTm = key[4]
    const defect = parseInt(key[5])
    const exist = _.find(
      wafers,
      w =>
        w.lotId === lotId &&
        w.stepId === stepId &&
        w.waferNo === waferNo &&
        w.productId === productId &&
        w.scanTm === scanTm
    )
    if (exist) {
      exist.defects = [...exist.defects, defect]
    } else {
      wafers.push({
        lotId,
        stepId,
        waferNo,
        productId,
        scanTm,
        defects: [defect],
        defectCache: ''
      })
    }
  }
  return wafers
}
