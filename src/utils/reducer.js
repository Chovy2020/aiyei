const initialState = {
  activeMenu: 'toolbox',
  toolBoxLoading: false,
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
  wafers: [
    {
      lotId: 'SQCA00019',
      stepId: '4628_KTCTBRDP',
      waferNo: '10.10',
      productId: 'GDM119',
      scanTm: '2009-07-06 09:34:44',
      defects: []
    }
  ],
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
