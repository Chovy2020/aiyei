const initialState = {
  activeMenu: 'toolbox',
  toolBoxLoading: false,
  prevPage: null,
  /**
   * wafers: 选中的wafer缓存，新增标签页 传参用
   * @param {Array<Wafer>} wafers waferList
   */
  /**
   * Wafer
   * @param {String} lotId
   * @param {String} productId
   * @param {String} waferNo
   * @param {String} stepId
   * @param {String} scanTm
   * @param {Array<Number>} defects 前端选中的点的集合
   */
  wafers: [],
  /**
   * bars: 包括wafer与bar的集合(同一个bar可能包含多片wafer的defect的集合)
   * @param {Array<Number>} bars selectedBarList
   */
  bars: []
}

const initReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'CHANGE_MENU':
      return {
        ...state,
        activeMenu: action.payload
      }
    case 'CHANGE_TOOLBOX_LOADING':
      return {
        ...state,
        toolBoxLoading: action.payload
      }
    case 'CHANGE_PREV_PAGE':
      return {
        ...state,
        prevPage: action.payload
      }
    case 'CHANGE_WAFERS':
      return {
        ...state,
        wafers: action.payload
      }
    case 'CHANGE_BARS':
      return {
        ...state,
        bars: action.payload
      }
    default:
      return state
  }
}

export default initReducer
