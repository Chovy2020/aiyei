// 表单输入
const changeForm = payload => ({
  type: 'CHANGE_FORM',
  payload
})

const changeItems = payload => ({
  type: 'CHANGE_ITEMS',
  payload
})

module.exports = {
  changeForm,
  changeItems
}
