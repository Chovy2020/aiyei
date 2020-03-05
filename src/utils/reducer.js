// 全局数据
const initialState = {
  shiftMultipleMode: false,
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
  params: {
    x: 'mb',
    x2n: '',
    y: '100',
    bars: []
  }
}

const initReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'CHANGE_SHIFT_MULTIPLE_MODE':
      return {
        ...state,
        shiftMultipleMode: action.payload
      }
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
    case 'CHANGE_PARAMS':
      return {
        ...state,
        params: action.payload
      }
    default:
      return state
  }
}

export default initReducer
