const initialState = {
  previousPage: '',
  /**
   * waferSelected: 选中的wafer缓存，标签切换传参
   * @param {String} key  标签页码 -> 通过previousPage获取
   * @param {Array<Wafer>} value waferList
   */
  /**
   * Wafer
   * @param {String} lotId
   * @param {String} productId
   * @param {String} waferNo
   * @param {String} stepId
   * @param {String} scanTm
   * @param {Array<Number>} defects 前端选中的点的集合，优先级比redisKey高
   * @param {String} defectIdRedisKey 后端缓存的defect集合的id
   */
  waferSelected: {}
}

const initReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'CHANGE_PREVIOUS_PAGE':
      return {
        ...state,
        previousPage: action.payload
      }
    case 'INIT_PAGE': {
      const { waferSelected } = state
      waferSelected[action.payload] = []
      return {
        ...state,
        waferSelected
      }
    }
    case 'CHANGE_WAFER_SELECTED':
      return {
        ...state,
        waferSelected: action.payload
      }
    default:
      return state
  }
}

export default initReducer
