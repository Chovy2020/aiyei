const initState = {
  defect: {
    existsImg: false, // 有照片
    mbHave: true, // Manual Classified
    secondScan: false, // 有前层scan结果
    seeLastScan: false, // 多次scan只看最后一次
    startTm: '', // 开始日期 结束日期 yyyy-MM-dd
    endTm: ''
  }
}

export default (state = initState, action) => {
  switch (action.type) {
    case 'CHANGE_FORM':
      return {
        ...state,
        defect: action.payload
      }
    default:
      return state
  }
}
