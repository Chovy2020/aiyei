import { DATA_QUERY_QUERY, DATA_QUERY_INIT } from './constant'

const initState = {
  items: DATA_QUERY_INIT.map(i => DATA_QUERY_QUERY[i]),
  itemSelected: [],
  defect: {
    existsImg: false, // 有照片
    mbHave: true, // Manual Classified
    secondScan: false, // 有前层scan结果
    seeLastScan: false, // 多次scan只看最后一次
    startTm: '', // 开始日期 结束日期 yyyy-MM-dd
    endTm: ''
  },
  filters: {
    mbs: [],
    abc: [],
    rbs: [],
    tests: [],
    clusterIds: [],
    repeaterIds: [],
    zoneIds: [],
    subDieIds: []
  }
}

export default (state = initState, action) => {
  switch (action.type) {
    case 'CHANGE_FORM':
      return {
        ...state,
        defect: action.payload
      }
    case 'CHANGE_ITEMS':
      return {
        ...state,
        items: action.payload
      }
    case 'CHANGE_ITEM_SELECTED':
      return {
        ...state,
        itemSelected: action.payload
      }
    case 'CHANGE_FILTERS':
      return {
        ...state,
        filters: action.payload
      }
    default:
      return state
  }
}
