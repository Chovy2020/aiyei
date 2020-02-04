const initialState = {
  activeMenu: 'toolbox',
  toolBoxLoading: false,
  previousPage: '0',
  /**
   * waferSelected: 选中的wafer缓存，标签切换传参
   * @param {String} key  标签页码 -> 通过previousPage获取
   * @param {Object} pageSelected
   */
  /**
   * pageSelected: 包括wafer与bar的集合(同一个bar可能包含多片wafer的defect的集合)
   * @param {Array<Wafer>} wafers waferList
   * @param {Array<Number>} bars selectedBarList
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
  waferSelected: {
    '0': {
      wafers: [
        // {
        //   lotId: 'B0001.000',
        //   stepId: 'P1_ASI',
        //   waferNo: '1',
        //   productId: 'Device01',
        //   scanTm: '2018-06-05 12:30:35',
        //   defects: [],
        //   defectIdRedisKey: '9c7159ca-22d7-47c9-af6b-9cb0d224c024'
        // },
        // {
        //   lotId: 'B0001.000',
        //   stepId: 'M3_CMP',
        //   waferNo: '1',
        //   productId: 'Device01',
        //   scanTm: '2018-06-05 12:30:35',
        //   defects: [],
        //   defectIdRedisKey: 'd9f559e3-94f9-4d32-809d-0332f82f0ae2'
        // },
        {
          lotId: 'SQCA00019',
          stepId: '4628_KTCTBRDP',
          waferNo: '10.10',
          productId: 'GDM119',
          scanTm: '2009-07-06 09:34:44',
          defects: [],
          defectIdRedisKey: '7a193ae0-f889-4839-8a10-ce7cfb1d944b'
        }
      ],
      bars: []
    }
  }
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
    case 'CHANGE_WAFER_SELECTED': {
      const { waferSelected } = state
      const { page, wafers, bars } = action.payload
      waferSelected[page] = { wafers, bars }
      return {
        ...state,
        waferSelected
      }
    }
    default:
      return state
  }
}

export default initReducer
