import { get, post, put, Delete } from '@/utils/api'
// 公共部分
// 表单product
export const getProduct = data => get('product/list')
// 表单step
export const getStep = product => get(`layer/list/${product}`)
// 表单doi
export const getDoi = (product,step) => get(`mb/list/${product}/${step}`)


// doiHandling
// 表格
export const getDoiList = data => get('setup/doi/list')
// 批量增加表格
export const addDoi = data => post('setup/doi/addbatch', data)
// 批量修改
export const editDoi = data => put('setup/doi/updatebatch', data)
// 获取单条数据
export const getEditList = (product, step, doi) => get(`setup/doi/get/${product}/${step}/${doi}`)
// 单个删除
export const deleteDoi = (product, step, doi) => Delete(`setup/doi/delete/${product}/${step}/${doi}`)

// Hol Setting 
// 表单MB Value
export const getMbValue = data => get('swp/yaxis/mb,')
// 表格
export const getHolList = data => get('setup/hol/list')
// 批量增加表格
export const addHol = data => post('setup/hol/add', data)
// 删除
export const deleteHol = (product, step, doi) => Delete(`setup/hol/delete/${product}/${step}/${doi}`)
