// 登录人
export const changeUser = payload => ({
  type: 'CHANGE_USER',
  payload
})

// 修改页面传递需要使用的wafers
export const changeWafers = payload => ({
  type: 'CHANGE_WAFERS',
  payload
})
// singleMap与chartSelection页面表格同步 需要的参数
export const changeParams = payload => ({
  type: 'CHANGE_PARAMS',
  payload
})
// 保存前一个页面的信息，部分页面初始化 需要知道从哪个页面跳转过来的
export const changePrevPage = payload => ({
  type: 'CHANGE_PREV_PAGE',
  payload
})
// 全局Loading控制
export const changeToolboxLoading = payload => ({
  type: 'CHANGE_TOOLBOX_LOADING',
  payload
})
// 菜单图表高亮
export const changeMenu = payload => ({
  type: 'CHANGE_MENU',
  payload
})
// shift按下连选模式
export const changeShiftMultipleMode = payload => ({
  type: 'CHANGE_SHIFT_MULTIPLE_MODE',
  payload
})