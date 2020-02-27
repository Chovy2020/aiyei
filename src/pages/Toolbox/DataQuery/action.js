// 表单输入
export const changeParams = payload => ({
  type: 'CHANGE_PARAMS',
  payload
})
// 拖拽列的数组
export const changeItems = payload => ({
  type: 'CHANGE_ITEMS',
  payload
})
// 每一个拖拽框内部选中高亮部分
export const changeItemSelected = payload => ({
  type: 'CHANGE_ITEM_SELECTED',
  payload
})
// 点击load，生成全局可以使用的filter预选项
export const changeFilterOption = payload => ({
  type: 'CHANGE_FILTER_OPTION',
  payload
})
