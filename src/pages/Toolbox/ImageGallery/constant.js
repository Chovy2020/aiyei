export const LAYOUT_SIZE = [3, 4, 5]

export const VIEW_GROUPS = [
  ['Manual Bin', 'mb'],
  ['Rough Bin', 'rb'],
  ['ADC Bin', 'adc'],
  ['Lot ID', 'lotId'],
  ['Wafer ID', 'waferId'],
  ['Step ID', 'stepId'],
  ['Product ID', 'productId'],
  ['scan time', 'scanTm'],
  ['review time', 'reviewTm']
]

export const CATEGORY_TYPES = [
  ['Manual Bin', 'mb'],
  ['Rough Bin', 'rb'],
  ['ADC Bin', 'adc']
]

export const FONT_SIZE = ['12', '14', '16', '18']

export const getLotId = waferId => waferId.split('|')[0]
export const getWaferNo = waferId => waferId.split('|')[1]
export const getDefectId = waferId => waferId.split('|')[5]
export const getStepId = waferId => waferId.split('|')[3]
