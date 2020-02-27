// 每排显示几张图片
export const LAYOUT_SIZE = [3, 4, 5]
// groups 列表
export const VIEW_GROUPS = [
  ['Manual Bin', 'MB'],
  ['Rough Bin', 'RB'],
  ['ADC Bin', 'ADC'],
  ['Lot ID', 'LotId'],
  ['Wafer ID', 'WaferId'],
  ['Step ID', 'StepId'],
  ['Product ID', 'ProductId'],
  ['scan time', 'ScanTime'],
  ['review time', 'ReviewTime']
]
// 分类列表
export const CATEGORY_TYPES = [
  ['Manual Bin', 'mb'],
  ['Rough Bin', 'rb'],
  ['ADC Bin', 'adc']
]
// 字体大小
export const FONT_SIZE = ['12', '14', '16', '18']
// 图片上信息显示
export const getLotId = waferId => waferId.split('|')[0]
export const getWaferNo = waferId => waferId.split('|')[1]
export const getDefectId = waferId => waferId.split('|')[5]
export const getStepId = waferId => waferId.split('|')[3]
