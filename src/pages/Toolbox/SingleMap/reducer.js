const initState = {
    singleSelected: {},
    singleWafers: {}
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
      default:
        return state
    }
  }
  