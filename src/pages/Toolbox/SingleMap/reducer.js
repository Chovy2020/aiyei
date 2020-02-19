const initState = {
    singleSelected: {},
    singleWafers: {},
    /**
     * singleParams: { name: params }
     * params: { x, x2n, y, bars: [] }
     */
    singleParams: {},
  }
  
  export default (state = initState, action) => {
    switch (action.type) {
      case 'CHANGE_SINGLE_SELETED': {
        const { name, selected } = action.payload
        state.singleSelected[name] = selected
        return state
      }
      case 'CHANGE_SINGLE_WAFERS': {
        const { name, wafers } = action.payload
        state.singleWafers[name] = wafers
        return state
      }
      case 'CHANGE_SINGLE_PARAMS':{
        const { name, params } = action.payload
        state.singleParams[name] = params
        return state
      }
      default:
        return state
    }
  }
  