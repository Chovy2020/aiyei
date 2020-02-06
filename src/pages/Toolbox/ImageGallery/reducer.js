const initState = {
  imageSelected: {},
  // image页面，不考虑bars
  imageWafers: {}
}

export default (state = initState, action) => {
  switch (action.type) {
    case 'CHANGE_SELETED':
      return {
        ...state,
        imageSelected: action.payload
      }
    case 'CHANGE_WAFERS':
      return {
        ...state,
        imageWafers: action.payload
      }
    default:
      return state
  }
}
