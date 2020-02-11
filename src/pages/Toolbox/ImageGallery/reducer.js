const initState = {
  imageSelected: {},
  // image页面，不考虑bars
  prevWafers: {}
}

export default (state = initState, action) => {
  switch (action.type) {
    case 'CHANGE_SELETED':
      return {
        ...state,
        imageSelected: action.payload
      }
    case 'CHANGE_PREV_WAFERS':
      return {
        ...state,
        prevWafers: action.payload
      }
    default:
      return state
  }
}
