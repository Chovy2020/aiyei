import { get, post, put, Delete } from '@/utils/api'
// 公共部分
// 表单product
export const getProduct = data => get('product/list')
// 表单step
export const getStep = product => get(`layer/list/${product}`)
// 表单MB
export const getMb = (product,step) => get(`mb/list/${product}/${step}`)
// 表单Y
export const getY = data => get('swp/yaxis/mb,')

// Key Defect Trend Chart
// 获取最初Chart的数据
export const getKeyDefectList = data => get('tc/list')
// 增加chart
export const addKeyDefectList = (product, step, mb, yxais, lastmonth) => get(`tc/getandsave/${product}/${step}/${mb}/${yxais}/${lastmonth}`)
// 删除chart
export const deleteKeyDefectList = (product, step, mb, yxais, lastmonth) => Delete(`tc/remove/${product}/${step}/${mb}/${yxais}/${lastmonth}`)

// Hol Setting 
// chart初始化查询
export const getHolList = data => get('hc/list')
// 增加chart
export const addHol = (product, lastmonth) => get(`hc/getandsave/${product}/${lastmonth}`)
// 删除
export const deleteHol = (product, lastmonth) => Delete(`hc/remove/${product}/${lastmonth}`)
